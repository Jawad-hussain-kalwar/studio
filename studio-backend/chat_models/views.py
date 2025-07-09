"""
Views for chat completion and model management.
"""
import logging
import json
import time
import uuid
from typing import Iterator, Dict, Any
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.http import JsonResponse, StreamingHttpResponse
from django.core.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .ollama_client import OllamaClient, OllamaError, OllamaConnectionError, OllamaModelError
from .validators import ChatRequestValidator
import ollama

logger = logging.getLogger(__name__)


class ChatModelList(APIView):
    """Return the list of chat-completion models available in Ollama.

    Uses the shared OllamaClient wrapper so we don't duplicate HTTP logic and we
    always benefit from whatever metadata that helper exposes (description,
    contextLength when available, etc.).
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            client = OllamaClient()
            models = client.get_available_models()
            return Response(models)
        except Exception as e:
            logger.error(f"Error fetching models: {e}")
            return Response(
                {"error": "Unable to fetch models", "message": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class HealthCheckView(APIView):
    """Health check endpoint to verify Ollama connectivity."""
    
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            client = OllamaClient()
            is_connected = client.health_check()
            
            return Response({
                "status": "healthy" if is_connected else "unhealthy",
                "ollamaConnected": is_connected,
                "timestamp": "2024-01-01T00:00:00Z"  # Simplified timestamp
            })
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return Response({
                "status": "unhealthy",
                "ollamaConnected": False,
                "error": str(e),
                "timestamp": "2024-01-01T00:00:00Z"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@method_decorator(csrf_exempt, name='dispatch')
class ChatCompletionView(APIView):
    """Handle /v1/chat/completions endpoint that proxies to Ollama."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            request_id = str(uuid.uuid4())
            logger.info(f"[request:{request_id}] Chat completion request received")
            
            # Validate and clean request data
            validator = ChatRequestValidator()
            cleaned_data = validator.validate_request(request.data)
            
            logger.info(f"[request:{request_id}] Cleaned request data: {cleaned_data}")
            
            # Create Ollama client
            client = OllamaClient()
            
            # Check if streaming is requested - default to True for useChat compatibility
            # The AI SDK useChat hook expects streaming by default
            is_streaming = cleaned_data.get('stream', True)
            logger.info(f"[request:{request_id}] Streaming requested: {is_streaming}")
            
            if is_streaming:
                # Return OpenAI-compatible streaming response
                return self._create_streaming_response(client, cleaned_data, request_id)
            else:
                # Non-streaming response
                return self._create_non_streaming_response(client, cleaned_data, request_id)
                
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            return Response({
                "error": "Invalid request format",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except OllamaConnectionError as e:
            logger.error(f"Ollama connection error: {e}")
            return Response({
                "error": "Unable to connect to Ollama",
                "message": "The AI service is currently unavailable. Please try again later."
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except OllamaModelError as e:
            logger.error(f"Ollama model error: {e}")
            return Response({
                "error": "Model not available",
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except OllamaError as e:
            logger.error(f"Ollama error: {e}")
            return Response({
                "error": "AI service error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.error(f"Unexpected error in chat completion: {e}")
            return Response({
                "error": "Internal server error",
                "message": "An unexpected error occurred. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _create_streaming_response(self, client: OllamaClient, cleaned_data: Dict[str, Any], request_id: str) -> StreamingHttpResponse:
        """Create Vercel AI SDK compatible streaming response."""
        try:
            logger.info(f"[request:{request_id}] Creating streaming response...")
            
            def vercel_ai_stream_generator() -> Iterator[bytes]:
                """
                Generator that yields Vercel AI SDK compatible data stream.
                
                Format: TYPE_ID:CONTENT_JSON\n
                - Text parts: 0:"text content"\n
                - Finish message: d:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":20}}\n
                """
                try:
                    logger.info(f"[request:{request_id}] Starting stream generation...")
                    
                    prompt_tokens = 0
                    completion_tokens = 0
                    
                    # Stream content chunks from Ollama (raw stream)
                    ollama_messages = client._format_messages_for_ollama(cleaned_data['messages'])
                    
                    # Use the raw Ollama stream directly
                    stream = client.client.chat(  # type: ignore
                        model=cleaned_data['model'],
                        messages=ollama_messages,  # type: ignore[arg-type]
                        stream=True,
                        options={
                            "temperature": cleaned_data.get('temperature', 0.7),
                            "top_p": cleaned_data.get('top_p', 0.9),
                        }
                    )
                    
                    for chunk_idx, ollama_chunk in enumerate(stream):
                        logger.debug(f"[request:{request_id}] Processing chunk {chunk_idx}: {ollama_chunk}")
                        
                        if ollama_chunk.get('done'):
                            # Store final usage stats
                            prompt_tokens = ollama_chunk.get('prompt_eval_count', 0)
                            completion_tokens = ollama_chunk.get('eval_count', 0)
                            
                            # Send finish message part
                            finish_message = {
                                "finishReason": "stop",
                                "usage": {
                                    "promptTokens": prompt_tokens,
                                    "completionTokens": completion_tokens
                                }
                            }
                            yield f"d:{json.dumps(finish_message)}\n".encode("utf-8")
                            break
                        else:
                            # Content chunk - send as text part
                            content = ollama_chunk.get('message', {}).get('content', '')
                            if content:
                                # Text part format: 0:"content"
                                yield f"0:{json.dumps(content)}\n".encode("utf-8")
                    
                    logger.info(f"[request:{request_id}] Stream generation completed")
                    
                except Exception as e:
                    logger.error(f"[request:{request_id}] Stream generation error: {e}")
                    # Send error part
                    yield f"3:{json.dumps(str(e))}\n".encode("utf-8")
                    # Send finish message with error
                    finish_message = {
                        "finishReason": "error",
                        "usage": {
                            "promptTokens": 0,
                            "completionTokens": 0
                        }
                    }
                    yield f"d:{json.dumps(finish_message)}\n".encode("utf-8")
            
            # Create streaming response with proper headers
            response = StreamingHttpResponse(
                vercel_ai_stream_generator(),
                content_type='text/plain'
            )
            
            # Critical headers for Vercel AI SDK streaming
            response['Cache-Control'] = 'no-cache'
            response['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
            response['x-vercel-ai-data-stream'] = 'v1'  # Required for Vercel AI SDK
            response['Access-Control-Allow-Origin'] = '*'  # Configure properly for production
            response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            
            logger.info(f"[request:{request_id}] Streaming response created successfully")
            return response
            
        except Exception as stream_error:
            logger.error(f"[request:{request_id}] Streaming setup error: {stream_error}")
            raise OllamaError(f"Streaming setup failed: {stream_error}")

    def _create_non_streaming_response(self, client: OllamaClient, cleaned_data: Dict[str, Any], request_id: str) -> Response:
        """Create non-streaming response."""
        logger.info(f"[request:{request_id}] Generating non-streaming response...")
        
        ollama_response = client.chat_completion(
            model=cleaned_data['model'],
            messages=cleaned_data['messages'],
            temperature=cleaned_data.get('temperature', 0.7),
            top_p=cleaned_data.get('top_p', 0.9)
        )
        
        logger.info(f"[request:{request_id}] Non-streaming response generated successfully")
        return Response(ollama_response) 