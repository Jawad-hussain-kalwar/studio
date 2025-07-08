from django.urls import path
from .views import ChatModelList, ChatCompletionView, HealthCheckView

urlpatterns = [
    path('models/', ChatModelList.as_view(), name='chat-models-list'),
    path('chat/completions/', ChatCompletionView.as_view(), name='chat-completions'),
    path('health/', HealthCheckView.as_view(), name='health-check'),
] 