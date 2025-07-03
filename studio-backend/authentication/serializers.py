from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer that returns user data in camelCase format for frontend"""
    id = serializers.IntegerField(source='pk')
    email = serializers.EmailField()
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    profilePicture = serializers.URLField(source='profile.profile_picture', allow_null=True)
    oauthProvider = serializers.CharField(source='profile.oauth_provider')
    createdAt = serializers.DateTimeField(source='profile.created_at')

    class Meta:
        model = User
        fields = ['id', 'email', 'firstName', 'lastName', 'profilePicture', 'oauthProvider', 'createdAt']


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for auth response with JWT token and user data"""
    access = serializers.CharField()
    user = UserSerializer() 