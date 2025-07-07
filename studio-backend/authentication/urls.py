from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='auth_health'),
    
    # Email authentication
    path('login/', views.email_login, name='email_login'),
    path('register/', views.email_register, name='email_register'),
    
    # Google OAuth flow
    path('oauth/google/', views.google_oauth_init, name='google_oauth_init'),
    path('oauth/google/callback/', views.google_oauth_callback, name='google_oauth_callback'),
] 