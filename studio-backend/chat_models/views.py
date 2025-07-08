"""
Views for chat completion and model management.
"""
import logging
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.http import JsonResponse, StreamingHttpResponse
from django.core.exceptions import ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from .ollama_client import OllamaClient, OllamaError, OllamaConnectionError, OllamaModelError
from .streaming import create_chat_stream_response
from .validators import ChatRequestValidator, ResponseFormatter

logger = logging.getLogger(__name__)


class ChatModelList(APIView):
    """Return the list of chat-completion models available in Ollama.

    Uses the shared OllamaClient wrapper so we don’t duplicate HTTP logic and we
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
            logger.info(f"Chat completion request received: {request.data}")
            
            # Validate request
            validator = ChatRequestValidator()
            cleaned_data = validator.validate_request(request.data)
            logger.info(f"Cleaned request data: {cleaned_data}")
            
            # Create Ollama client
            client = OllamaClient()
            
            # Check if streaming is requested
            is_streaming = cleaned_data.get('stream', False)
            logger.info(f"Streaming requested: {is_streaming}")
            
            if is_streaming:
                # Return streaming response
                try:
                    logger.info("Creating streaming response...")
                    
                    def stream_generator():
                        """Streaming generator for SSE responses."""
                        try:
                            logger.info("Starting stream generation...")
                            
                            # Use Ollama client for streaming
                            for chunk in client.chat_completion_stream(
                                model=cleaned_data['model'],
                                messages=cleaned_data['messages'],
                                temperature=cleaned_data.get('temperature', 0.7),
                                top_p=cleaned_data.get('top_p', 0.9)
                            ):
                                logger.info(f"Stream chunk: {chunk}")
                                # Format as SSE
                                yield f"data: {json.dumps(chunk)}\n\n"
                                
                            # Send done signal
                            yield "data: [DONE]\n\n"
                            
                        except Exception as e:
                            logger.error(f"Stream generation error: {e}")
                            error_chunk = {
                                "error": str(e),
                                "type": "stream_error"
                            }
                            yield f"data: {json.dumps(error_chunk)}\n\n"
                    
                    response = StreamingHttpResponse(
                        stream_generator(),
                        content_type='text/event-stream; charset=utf-8'
                    )
                    response['Cache-Control'] = 'no-cache'
                    response['X-Accel-Buffering'] = 'no'  # Disable nginx buffering
                    
                    logger.info("Streaming response created successfully")
                    return response
                    
                except Exception as stream_error:
                    logger.error(f"Streaming setup error: {stream_error}")
                    return JsonResponse({
                        "error": "Streaming setup failed",
                        "message": str(stream_error)
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            else:
                # Non-streaming response
                logger.info("Generating non-streaming response...")
                
                ollama_response = client.chat_completion(
                    model=cleaned_data['model'],
                    messages=cleaned_data['messages'],
                    temperature=cleaned_data.get('temperature', 0.7),
                    top_p=cleaned_data.get('top_p', 0.9)
                )
                
                logger.info(f"Ollama response: {ollama_response}")
                
                # The ollama_response is already formatted correctly by the client
                logger.info(f"Returning response: {ollama_response}")
                return Response(ollama_response)
                
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