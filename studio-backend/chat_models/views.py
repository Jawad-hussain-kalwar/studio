from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .services import get_chat_models


class ChatModelList(APIView):
    """Return the list of chat-completion models available in Ollama."""

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        models = get_chat_models()
        return Response(models) 