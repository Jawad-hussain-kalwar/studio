from django.shortcuts import render
import json
import base64
from urllib.parse import urlencode
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from google.auth.transport import requests
from google.oauth2 import id_token
import google_auth_oauthlib.flow

from .models import UserProfile
from .serializers import UserSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_init(request):
    """Redirect to Google OAuth"""
    # Google OAuth flow configuration
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        {
            "web": {
                "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_OAUTH_REDIRECT_URI]
            }
        },
        scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
    )
    flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
    
    # Generate authorization URL
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    
    # Store state in session for security
    request.session['oauth_state'] = state
    
    return redirect(authorization_url)


@api_view(['GET'])
@permission_classes([AllowAny])
def google_oauth_callback(request):
    """Handle Google OAuth callback"""
    try:
        # Get authorization code and state from callback
        code = request.GET.get('code')
        state = request.GET.get('state')
        error = request.GET.get('error')
        
        print(f"OAuth callback received - Code: {'Present' if code else 'Missing'}, State: {state}, Error: {error}")
        
        if error:
            print(f"OAuth error from Google: {error}")
            return redirect(f"{settings.FRONTEND_URL}/signin?error=OAuth authorization failed")
        
        if not code:
            print("No authorization code received from Google")
            return redirect(f"{settings.FRONTEND_URL}/signin?error=No authorization code received")
        
        # Verify state for security (optional for minimal setup)
        stored_state = request.session.get('oauth_state')
        print(f"Stored state: {stored_state}, Received state: {state}")
        if stored_state and stored_state != state:
            print("OAuth state mismatch - possible CSRF attack")
            return redirect(f"{settings.FRONTEND_URL}/signin?error=Invalid OAuth state")
        
        print("Creating Google OAuth flow...")
        # Exchange code for token
        flow = google_auth_oauthlib.flow.Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
                    "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [settings.GOOGLE_OAUTH_REDIRECT_URI]
                }
            },
            scopes=['openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']
        )
        flow.redirect_uri = settings.GOOGLE_OAUTH_REDIRECT_URI
        
        print("Fetching token from Google...")
        # Get token
        flow.fetch_token(code=code)
        
        print("Verifying ID token...")
        # Verify and decode the ID token
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, 
            requests.Request(), 
            settings.GOOGLE_OAUTH_CLIENT_ID
        )
        
        print(f"ID token verified. User info: {id_info.get('email', 'No email')}")
        
        # Extract user info from token
        google_id = id_info['sub']
        email = id_info['email']
        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        profile_picture = id_info.get('picture', '')
        
        print(f"Creating/finding user for email: {email}")
        
        # Find or create user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
            }
        )
        
        print(f"User {'created' if created else 'found'}: {user.email}")
        
        # Create or update user profile
        profile, profile_created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'oauth_provider': 'google',
                'oauth_id': google_id,
                'profile_picture': profile_picture,
            }
        )
        
        # Update profile if it already existed
        if not profile_created:
            profile.profile_picture = profile_picture
            profile.save()
        
        print("Generating JWT token...")
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        print("Serializing user data...")
        # Serialize user data
        user_data = UserSerializer(user).data
        user_encoded = base64.b64encode(json.dumps(user_data).encode()).decode()
        
        print(f"Redirecting to frontend with token...")
        # Redirect to frontend with token
        params = {
            'token': access_token,
            'user': user_encoded
        }
        redirect_url = f"{settings.FRONTEND_URL}/app?{urlencode(params)}"
        print(f"Redirect URL: {redirect_url}")
        return redirect(redirect_url)
        
    except Exception as e:
        print(f"OAuth callback error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return redirect(f"{settings.FRONTEND_URL}/signin?error=Authentication failed")


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({'status': 'ok', 'message': 'Auth service is running'})
