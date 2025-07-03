from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='auth_health'),
    
    # Google OAuth flow
    path('oauth/google/', views.google_oauth_init, name='google_oauth_init'),
    path('oauth/google/callback/', views.google_oauth_callback, name='google_oauth_callback'),
] 