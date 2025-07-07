from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    """Extended user profile for OAuth and email authentication data"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    oauth_provider = models.CharField(
        max_length=20, 
        choices=[
            ('email', 'Email'),
            ('google', 'Google'),
            ('apple', 'Apple'),
        ],
        default='email'
    )
    oauth_id = models.CharField(max_length=255, blank=True, null=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} ({self.oauth_provider})"

    class Meta:
        db_table = 'user_profile'
        constraints = [
            # OAuth users must have oauth_id, email users don't need it
            models.CheckConstraint(
                check=models.Q(oauth_provider='email') | models.Q(oauth_id__isnull=False),
                name='oauth_id_required_for_oauth_providers'
            ),
        ]
