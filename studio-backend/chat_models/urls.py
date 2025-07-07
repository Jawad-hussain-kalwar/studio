from django.urls import path
from .views import ChatModelList

urlpatterns = [
    path('models/', ChatModelList.as_view(), name='chat-models-list'),
] 