import time
import json
import logging
from decimal import Decimal
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import User
from django.contrib.gis.geoip2 import GeoIP2
from django.core.exceptions import ImproperlyConfigured
from .models import RequestLog

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to automatically log all API requests to RequestLog model.
    Captures timing, model usage, costs, and geographic data.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Initialize GeoIP2 (optional, fails gracefully if not configured)
        try:
            self.geoip = GeoIP2()
        except (ImproperlyConfigured, Exception) as e:
            logger.warning(f"GeoIP2 not available: {e}")
            self.geoip = None
        super().__init__(get_response)
    
    def process_request(self, request):
        """Store request start time."""
        request._request_start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Log the request after processing."""
        # Only log API endpoints (skip static files, admin, etc.)
        if not self._should_log_request(request):
            return response
        
        try:
            # Calculate latency
            start_time = getattr(request, '_request_start_time', time.time())
            latency_ms = (time.time() - start_time) * 1000
            
            # Extract basic request info
            endpoint = request.path
            method = request.method
            status_code = response.status_code
            user = request.user if request.user.is_authenticated else None
            
            # Get IP and geographic info
            ip_address = self._get_client_ip(request)
            country_code = self._get_country_code(ip_address)
            
            # Extract AI-specific data from response (for chat completions)
            ai_data = self._extract_ai_data(request, response)
            
            # Create log entry
            RequestLog.objects.create(
                endpoint=endpoint,
                method=method,
                status_code=status_code,
                latency_ms=latency_ms,
                user=user,
                ip_address=ip_address,
                country_code=country_code,
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                **ai_data
            )
            
        except Exception as e:
            # Don't break the request if logging fails
            logger.error(f"Failed to log request: {e}")
        
        return response
    
    def _should_log_request(self, request):
        """Determine if this request should be logged."""
        path = request.path
        
        # Log API endpoints
        if path.startswith('/api/') or path.startswith('/v1/'):
            return True
        
        # Skip static files, admin, health checks
        skip_paths = ['/admin/', '/static/', '/media/', '/favicon.ico', '/health/']
        return not any(path.startswith(skip) for skip in skip_paths)
    
    def _get_client_ip(self, request):
        """Extract client IP address from request."""
        # Check for forwarded headers first (for reverse proxies)
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _get_country_code(self, ip_address):
        """Get country code from IP address using GeoIP2."""
        if not self.geoip or not ip_address:
            return ''
        
        try:
            # Skip local/private IPs
            if ip_address in ['127.0.0.1', 'localhost'] or ip_address.startswith('192.168.'):
                return ''
            
            country = self.geoip.country(ip_address)
            return country.get('country_code', '')
        except Exception:
            return ''
    
    def _extract_ai_data(self, request, response):
        """Extract AI-specific data from chat completion requests."""
        ai_data = {
            'model_name': '',
            'prompt_tokens': None,
            'completion_tokens': None,
            'total_tokens': None,
            'cost_usd': None,
            'finish_reason': '',
        }
        
        # Only process chat completion endpoints
        if not request.path.startswith('/v1/chat/completions'):
            return ai_data
        
        try:
            # Extract model from request body
            if hasattr(request, 'body') and request.body:
                request_data = json.loads(request.body.decode('utf-8'))
                ai_data['model_name'] = request_data.get('model', '')
            
            # Extract token usage from response (for successful requests)
            if response.status_code == 200 and hasattr(response, 'content'):
                # For streaming responses, this might be empty
                # In practice, we'd need to capture this data during the chat view
                # For now, we'll populate basic model info
                pass
                
        except (json.JSONDecodeError, AttributeError, KeyError):
            # If we can't parse the data, that's ok - log what we can
            pass
        
        return ai_data


class TokenUsageTracker:
    """
    Helper class to track token usage in chat views.
    Call this from chat_models views to enhance logging.
    """
    
    @staticmethod
    def log_chat_completion(request, model_name, usage_data, cost_usd=None, finish_reason=''):
        """
        Update the most recent RequestLog entry with chat completion data.
        Call this from the chat completion view after getting Ollama response.
        """
        try:
            # Find the most recent log entry for this request
            # We identify it by user, endpoint, and timestamp (within last 30 seconds)
            from django.utils import timezone
            from datetime import timedelta
            
            recent_time = timezone.now() - timedelta(seconds=30)
            log_entry = RequestLog.objects.filter(
                user=request.user if request.user.is_authenticated else None,
                endpoint='/v1/chat/completions',
                created_at__gte=recent_time
            ).order_by('-created_at').first()
            
            if log_entry:
                # Update with AI-specific data
                log_entry.model_name = model_name
                log_entry.prompt_tokens = usage_data.get('prompt_tokens')
                log_entry.completion_tokens = usage_data.get('completion_tokens')
                log_entry.total_tokens = usage_data.get('total_tokens')
                log_entry.finish_reason = finish_reason
                
                if cost_usd:
                    log_entry.cost_usd = Decimal(str(cost_usd))
                
                log_entry.save()
                
        except Exception as e:
            logger.error(f"Failed to update request log with chat data: {e}") 