from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    """Extended user profile for OAuth data"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    oauth_provider = models.CharField(
        max_length=20, 
        choices=[('google', 'Google')],
        default='google'
    )
    oauth_id = models.CharField(max_length=255, unique=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} ({self.oauth_provider})"

    class Meta:
        db_table = 'user_profile'
