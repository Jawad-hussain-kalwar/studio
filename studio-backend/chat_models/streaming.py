"""
Server-Sent Events (SSE) utilities for streaming chat responses.
"""
import json
import logging
from typing import Iterator, Dict, Any
from django.http import StreamingHttpResponse

logger = logging.getLogger(__name__)


class SSEFormatter:
    """Utility class for formatting Server-Sent Events."""
    
    @staticmethod
    def format_data(data: Dict[str, Any]) -> str:
        """
        Format data as SSE data field.
        
        Args:
            data: Dictionary to be JSON-encoded and sent as SSE data
            
        Returns:
            Formatted SSE string with data field
        """
        json_data = json.dumps(data, ensure_ascii=False)
        return f"data: {json_data}\n\n"
    
    @staticmethod
    def format_event(event_type: str, data: Dict[str, Any] = None) -> str:
        """
        Format a complete SSE event with type and optional data.
        
        Args:
            event_type: Type of event (e.g., 'message', 'error', 'close')
            data: Optional data to include with the event
            
        Returns:
            Formatted SSE string with event type and data
        """
        lines = [f"event: {event_type}"]
        
        if data:
            json_data = json.dumps(data, ensure_ascii=False)
            lines.append(f"data: {json_data}")
        
        lines.append("")  # Empty line to end the event
        return "\n".join(lines) + "\n"
    
    @staticmethod
    def format_done() -> str:
        """Format the final 'done' message for SSE streams."""
        return "data: [DONE]\n\n"
    
    @staticmethod
    def format_error(error_message: str, error_code: str = "internal_error") -> str:
        """
        Format an error message for SSE streams.
        
        Args:
            error_message: Human-readable error message
            error_code: Machine-readable error code
            
        Returns:
            Formatted SSE error event
        """
        error_data = {
            "error": {
                "message": error_message,
                "code": error_code,
                "type": "server_error"
            }
        }
        return SSEFormatter.format_event("error", error_data)


def create_sse_response(
    stream_generator: Iterator[Dict[str, Any]], 
    content_type: str = "text/event-stream"
) -> StreamingHttpResponse:
    """
    Create a Django StreamingHttpResponse for Server-Sent Events.
    
    Args:
        stream_generator: Iterator that yields data dictionaries
        content_type: MIME type for the response
        
    Returns:
        Django StreamingHttpResponse configured for SSE
    """
    
    def event_stream():
        """Generator that formats data as SSE and handles errors gracefully."""
        try:
            # Send initial connection established event
            yield SSEFormatter.format_event("connected", {"status": "ready"})
            
            # Stream the actual data
            for chunk in stream_generator:
                if chunk:
                    yield SSEFormatter.format_data(chunk)
                    
            # Send completion signal
            yield SSEFormatter.format_done()
            
        except Exception as e:
            logger.error(f"Error in SSE stream: {e}")
            yield SSEFormatter.format_error(
                error_message="An error occurred while streaming the response",
                error_code="streaming_error"
            )
        finally:
            # Ensure stream is properly closed
            logger.info("SSE stream completed")
    
    response = StreamingHttpResponse(
        event_stream(),
        content_type=content_type
    )
    
    # Set required headers for SSE
    response['Cache-Control'] = 'no-cache'
    response['Connection'] = 'keep-alive'
    response['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
    
    return response


def create_chat_stream_response(ollama_stream: Iterator[Dict[str, Any]]) -> StreamingHttpResponse:
    """
    Create an SSE response specifically for chat completions.
    
    Args:
        ollama_stream: Iterator from OllamaClient.chat_completion_stream()
        
    Returns:
        StreamingHttpResponse configured for chat streaming
    """
    
    def chat_event_stream():
        """Stream chat completion chunks with proper error handling."""
        try:
            total_tokens = 0
            
            for chunk in ollama_stream:
                if chunk:
                    # Track token usage if available
                    if 'usage' in chunk:
                        total_tokens = chunk['usage'].get('totalTokens', total_tokens)
                    
                    yield SSEFormatter.format_data(chunk)
                    
            # Send final done message
            yield SSEFormatter.format_done()
            
            logger.info(f"Chat stream completed. Total tokens: {total_tokens}")
            
        except Exception as e:
            logger.error(f"Error in chat stream: {e}")
            
            # Send user-friendly error message
            error_message = "Sorry, I encountered an error while generating the response. Please try again."
            if "connection" in str(e).lower():
                error_message = "Unable to connect to the AI service. Please check if Ollama is running."
            elif "model" in str(e).lower():
                error_message = "The selected model is not available. Please try a different model."
                
            yield SSEFormatter.format_error(error_message, "chat_error")
    
    return create_sse_response(chat_event_stream())


class SSEKeepAlive:
    """Utility for sending keep-alive messages in long-running SSE streams."""
    
    def __init__(self, interval_seconds: int = 30):
        self.interval = interval_seconds
        
    def format_keepalive(self) -> str:
        """Format a keep-alive comment for SSE."""
        return ": keep-alive\n\n"
        
    def should_send_keepalive(self, last_message_time: float, current_time: float) -> bool:
        """Check if a keep-alive message should be sent."""
        return (current_time - last_message_time) >= self.interval 