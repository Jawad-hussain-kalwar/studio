#!/usr/bin/env python
"""
Script to get a JWT token for testing the dashboard API.
Usage: python get_test_token.py
"""
import os
import django
import sys

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'studio_backend.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

def get_or_create_test_user():
    """Get or create a test user."""
    username = 'testuser1'
    try:
        user = User.objects.get(username=username)
        print(f"Found existing user: {username}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email='testuser1@example.com',
            password='testpass123'
        )
        print(f"Created new user: {username}")
    return user

def main():
    user = get_or_create_test_user()
    
    # Generate JWT token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f"\nUser: {user.username}")
    print(f"User ID: {user.id}")
    print(f"JWT Access Token: {access_token}")
    print(f"\nTo test the dashboard API, use:")
    print(f'curl -H "Authorization: Bearer {access_token}" http://localhost:8000/api/dashboard/')
    print(f'curl -H "Authorization: Bearer {access_token}" http://localhost:8000/api/dashboard/health/')

if __name__ == '__main__':
    main() 