from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from decimal import Decimal


class RequestLog(models.Model):
    """
    Central logging table for all API requests.
    Captures timing, usage, costs, and geographic data.
    """
    # Primary identification
    id = models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Request details
    endpoint = models.CharField(max_length=64, help_text="API endpoint like '/v1/chat/completions'")
    method = models.CharField(max_length=10, default='POST')
    status_code = models.PositiveSmallIntegerField()
    latency_ms = models.FloatField(help_text="Request processing time in milliseconds")
    
    # AI-specific metrics
    model_name = models.CharField(max_length=128, blank=True, help_text="AI model used (e.g., 'gpt-4')")
    prompt_tokens = models.PositiveIntegerField(null=True, blank=True)
    completion_tokens = models.PositiveIntegerField(null=True, blank=True)
    total_tokens = models.PositiveIntegerField(null=True, blank=True)
    
    # Cost and geography
    cost_usd = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    country_code = models.CharField(max_length=2, blank=True, help_text="ISO country code")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    # User relationship
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    
    # Additional context
    user_agent = models.CharField(max_length=500, blank=True)
    finish_reason = models.CharField(max_length=50, blank=True, help_text="AI completion finish reason")
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['model_name']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status_code']),
            models.Index(fields=['endpoint']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.endpoint} - {self.status_code} - {self.created_at}"


class UserSession(models.Model):
    """
    Tracks user activity sessions for dashboard metrics.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_start = models.DateTimeField()
    session_end = models.DateTimeField(null=True, blank=True)
    
    # Aggregated metrics for this session
    total_requests = models.PositiveIntegerField(default=0)
    total_cost = models.DecimalField(max_digits=10, decimal_places=4, default=Decimal('0'))
    total_tokens = models.PositiveIntegerField(default=0)
    
    # Session metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['session_start']),
            models.Index(fields=['user', 'session_start']),
        ]
        ordering = ['-session_start']
    
    def __str__(self):
        return f"Session for {self.user.username} - {self.session_start}"


class FeedbackLog(models.Model):
    """
    User feedback and ratings for AI responses.
    """
    RATING_CHOICES = [
        (1, '1 Star - Poor'),
        (2, '2 Stars - Below Average'),
        (3, '3 Stars - Average'),
        (4, '4 Stars - Good'),
        (5, '5 Stars - Excellent'),
    ]
    
    request_log = models.ForeignKey(RequestLog, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    feedback_text = models.TextField(blank=True, help_text="Optional detailed feedback")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['rating']),
            models.Index(fields=['request_log']),
        ]
        ordering = ['-created_at']
        # Prevent duplicate ratings for the same request
        unique_together = ['request_log', 'user']
    
    def __str__(self):
        return f"{self.rating} stars - {self.request_log.model_name}"


class ThreatLog(models.Model):
    """
    Security events and threat detection logs.
    """
    THREAT_TYPES = [
        ('rate_limit', 'Rate Limit Exceeded'),
        ('suspicious_content', 'Suspicious Content Detected'),
        ('invalid_auth', 'Invalid Authentication Attempt'),
        ('malformed_request', 'Malformed Request'),
        ('prompt_injection', 'Potential Prompt Injection'),
        ('abuse_detection', 'Content Abuse Detection'),
    ]
    
    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    created_at = models.DateTimeField(auto_now_add=True)
    threat_type = models.CharField(max_length=50, choices=THREAT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    
    # Network information
    ip_address = models.GenericIPAddressField()
    user_agent = models.CharField(max_length=500, blank=True)
    country_code = models.CharField(max_length=2, blank=True)
    
    # Context
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    request_log = models.ForeignKey(RequestLog, null=True, blank=True, on_delete=models.SET_NULL)
    
    # Details
    description = models.TextField(blank=True)
    raw_data = models.JSONField(null=True, blank=True, help_text="Additional threat context data")
    
    # Resolution
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='resolved_threats'
    )
    
    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['threat_type']),
            models.Index(fields=['severity']),
            models.Index(fields=['ip_address']),
            models.Index(fields=['resolved']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.threat_type} ({self.severity}) - {self.created_at}"


class ModelUsageStats(models.Model):
    """
    Aggregated daily stats per model for faster dashboard queries.
    Populated by background tasks for performance.
    """
    date = models.DateField()
    model_name = models.CharField(max_length=128)
    
    # Daily aggregates
    total_requests = models.PositiveIntegerField(default=0)
    successful_requests = models.PositiveIntegerField(default=0)
    failed_requests = models.PositiveIntegerField(default=0)
    
    total_tokens = models.PositiveBigIntegerField(default=0)
    total_cost = models.DecimalField(max_digits=12, decimal_places=4, default=Decimal('0'))
    avg_latency_ms = models.FloatField(null=True, blank=True)
    
    # Performance metrics
    min_latency_ms = models.FloatField(null=True, blank=True)
    max_latency_ms = models.FloatField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['model_name', 'date']),
        ]
        ordering = ['-date', 'model_name']
        unique_together = ['date', 'model_name']
    
    def __str__(self):
        return f"{self.model_name} - {self.date}"
