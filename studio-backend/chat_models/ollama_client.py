"""
Ollama client for chat completions with streaming support using the official ollama library.
"""
import json
import logging
from typing import Dict, List, Any, Optional, Iterator
from django.conf import settings
import ollama
import uuid
import time

logger = logging.getLogger(__name__)


class OllamaError(Exception):
    """Base exception for Ollama-related errors."""
    pass


class OllamaConnectionError(OllamaError):
    """Raised when unable to connect to Ollama."""
    pass


class OllamaModelError(OllamaError):
    """Raised when model is not available or invalid."""
    pass


class OllamaClient:
    """
    Ollama client with support for chat completions and streaming.
    
    Uses the official ollama Python library for reliable communication.
    """
    
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or getattr(settings, 'OLLAMA_BASE_URL', 'http://localhost:11434')
        # Create client with custom host if needed
        if self.base_url != 'http://localhost:11434':
            self.client = ollama.Client(host=self.base_url)
        else:
            self.client = ollama.Client()

    def _format_messages_for_ollama(self, messages: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """
        Convert frontend message format to Ollama format.
        
        Frontend: [{"role": "user", "content": "Hello", "id": "...", "createdAt": "..."}]
        Ollama:   [{"role": "user", "content": "Hello"}]
        """
        return [
            {
                "role": msg["role"],
                "content": msg["content"]
            }
            for msg in messages
            if msg.get("role") in ["user", "assistant", "system"] and msg.get("content")
        ]

    def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available models from Ollama.
        
        Returns:
            List of models in frontend-compatible format
        """
        try:
            models_response = self.client.list()
            models = []
            
            for model in models_response.get("models", []):
                model_id = model["name"]
                entry = {
                    "id": model_id,
                    "name": model_id,
                }

                # Attach size from /list response if available
                if model.get("size"):
                    entry["parameterSize"] = model["size"]

                # Attempt to get richer metadata via `show` for each model.
                try:
                    # Ensure the payload is a mutable dict so we can safely mutate it below.
                    show_payload = dict(self.client.show(model_id))

                    # Drop fields we explicitly do NOT want to expose
                    show_payload.pop("license", None)
                    # Remove very large or unnecessary fields before sending to the frontend
                    # `modelfile` often contains the full model recipe and can be several KBs,
                    # while `tensors` is enormous (one entry per model weight tensor). Neither
                    # is required by the frontend and they dramatically inflate the response.
                    show_payload.pop("modelfile", None)
                    show_payload.pop("tensors", None)
                    mi = show_payload.get("model_info", {})
                    mi.pop("digest", None)

                    entry["metadata"] = show_payload
                except Exception as e:
                    # Non-fatal; log and continue with what we have.
                    logger.debug(f"Unable to fetch details for {model_id}: {e}")

                models.append(entry)
                
            return models
            
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {e}")
            raise OllamaConnectionError(f"Unable to connect to Ollama at {self.base_url}")

    def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.7,
        top_p: float = 0.9,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send non-streaming chat completion request.
        
        Returns response in OpenAI-compatible format for frontend.
        """
        try:
            ollama_messages = self._format_messages_for_ollama(messages)
            
            # Type ignore: Ollama library expects its own Message sequence; our dict list is accepted at runtime.
            response = self.client.chat(  # type: ignore
                model=model,
                messages=ollama_messages,  # type: ignore[arg-type]
                options={
                    "temperature": temperature,
                    "top_p": top_p,
                }
            )
            
            # Convert Ollama response to OpenAI-compatible format
            return self._format_completion_response(response)
            
        except ollama.ResponseError as e:
            if e.status_code == 404:
                logger.error(f"Model not found: {model}")
                raise OllamaModelError(f"Model '{model}' not found")
            else:
                logger.error(f"Ollama request failed: {e}")
                raise OllamaConnectionError(f"Request to Ollama failed: {e}")
        except Exception as e:
            logger.error(f"Chat completion error: {e}")
            raise OllamaError(f"Chat completion failed: {e}")

    def chat_completion_stream(
        self,
        model: str,
        messages: List[Dict[str, Any]],
        temperature: float = 0.7,
        top_p: float = 0.9,
        **kwargs
    ) -> Iterator[Dict[str, Any]]:
        """
        Send streaming chat completion request.
        
        Yields chunks in OpenAI-compatible format for frontend SSE.
        """
        try:
            ollama_messages = self._format_messages_for_ollama(messages)
            
            # Type ignore for same reason as above.
            stream = self.client.chat(  # type: ignore
                model=model,
                messages=ollama_messages,  # type: ignore[arg-type]
                stream=True,
                options={
                    "temperature": temperature,
                    "top_p": top_p,
                }
            )
            
            for chunk in stream:
                formatted_chunk = self._format_streaming_chunk(chunk)
                if formatted_chunk:
                    yield formatted_chunk
                    
        except ollama.ResponseError as e:
            if e.status_code == 404:
                logger.error(f"Model not found: {model}")
                raise OllamaModelError(f"Model '{model}' not found")
            else:
                logger.error(f"Ollama streaming request failed: {e}")
                raise OllamaConnectionError(f"Streaming request to Ollama failed: {e}")
        except Exception as e:
            logger.error(f"Chat completion streaming error: {e}")
            raise OllamaError(f"Chat completion streaming failed: {e}")

    def _format_completion_response(self, ollama_response: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Ollama response to OpenAI-compatible format."""
        return {
            "id": f"chatcmpl-{uuid.uuid4().hex[:8]}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": ollama_response.get("model", "unknown"),
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": ollama_response.get("message", {}).get("content", "")
                },
                "finishReason": "stop" if ollama_response.get("done") else "length"
            }],
            "usage": {
                "promptTokens": ollama_response.get("prompt_eval_count", 0),
                "completionTokens": ollama_response.get("eval_count", 0),
                "totalTokens": (
                    ollama_response.get("prompt_eval_count", 0) + 
                    ollama_response.get("eval_count", 0)
                )
            }
        }

    def _format_streaming_chunk(self, ollama_chunk: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Convert Ollama streaming chunk to OpenAI-compatible format."""
        if not ollama_chunk.get("message"):
            return None
            
        content = ollama_chunk["message"].get("content", "")
        
        # Generate a unique ID for this chunk
        chunk_id = f"chatcmpl-{uuid.uuid4().hex[:8]}"
        
        if ollama_chunk.get("done"):
            # Final chunk
            return {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": ollama_chunk.get("model", "unknown"),
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finishReason": "stop"
                }],
                "usage": {
                    "promptTokens": ollama_chunk.get("prompt_eval_count", 0),
                    "completionTokens": ollama_chunk.get("eval_count", 0),
                    "totalTokens": (
                        ollama_chunk.get("prompt_eval_count", 0) + 
                        ollama_chunk.get("eval_count", 0)
                    )
                }
            }
        else:
            # Content chunk
            return {
                "id": chunk_id,
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": ollama_chunk.get("model", "unknown"),
                "choices": [{
                    "index": 0,
                    "delta": {
                        "content": content
                    },
                    "finishReason": None
                }]
            }

    def health_check(self) -> bool:
        """Check if Ollama is accessible."""
        try:
            self.client.list()
            return True
        except:
            return False 