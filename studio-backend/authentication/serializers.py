from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer that returns user data in camelCase format for frontend"""
    id = serializers.IntegerField(source='pk')
    email = serializers.EmailField()
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    profilePicture = serializers.SerializerMethodField()
    oauthProvider = serializers.SerializerMethodField()
    createdAt = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'firstName', 'lastName', 'profilePicture', 'oauthProvider', 'createdAt']
    
    def get_profilePicture(self, obj):
        """Get profile picture, handle cases where profile doesn't exist"""
        try:
            return obj.profile.profile_picture
        except UserProfile.DoesNotExist:
            return None
    
    def get_oauthProvider(self, obj):
        """Get OAuth provider, handle cases where profile doesn't exist"""
        try:
            return obj.profile.oauth_provider
        except UserProfile.DoesNotExist:
            return 'email'
    
    def get_createdAt(self, obj):
        """Get created timestamp as ISO string, handle cases where profile doesn't exist"""
        try:
            return obj.profile.created_at.isoformat()
        except UserProfile.DoesNotExist:
            return obj.date_joined.isoformat()


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for auth response with JWT token and user data"""
    access = serializers.CharField()
    user = UserSerializer() 