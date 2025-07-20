"""
Dashboard aggregation services.
Efficiently computes dashboard metrics from RequestLog and related models.
"""
from django.db.models import Count, Sum, Avg, F, Q, Case, When
from django.db.models.functions import TruncDay, TruncHour
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from decimal import Decimal

from .models import RequestLog, UserSession, FeedbackLog, ThreatLog, ModelUsageStats


class DashboardService:
    """
    Service class for computing dashboard metrics and aggregations.
    """
    
    @staticmethod
    def parse_time_range(range_param: str, start_date=None, end_date=None) -> Tuple[datetime, datetime, str]:
        """
        Parse time range parameter and return (start, end, grain).
        
        Args:
            range_param: One of '24h', '7d', '1m', '3m', 'custom'
            start_date: Custom start date (for range='custom')
            end_date: Custom end date (for range='custom')
            
        Returns:
            Tuple of (start_datetime, end_datetime, grain)
        """
        now = timezone.now()
        
        if range_param == '24h':
            start = now - timedelta(hours=24)
            grain = 'hour'
        elif range_param == '7d':
            start = now - timedelta(days=7)
            grain = 'day'
        elif range_param == '1m':
            start = now - timedelta(days=30)
            grain = 'day'
        elif range_param == '3m':
            start = now - timedelta(days=90)
            grain = 'day'
        elif range_param == 'custom' and start_date and end_date:
            start = start_date
            now = end_date
            # Determine grain based on date range
            delta = end_date - start_date
            grain = 'hour' if delta.days <= 2 else 'day'
        else:
            # Default to 7 days
            start = now - timedelta(days=7)
            grain = 'day'
        
        return start, now, grain
    
    @classmethod
    def get_dashboard_data(cls, range_param: str, start_date=None, end_date=None, user=None) -> Dict[str, Any]:
        """
        Main method to get all dashboard data for a given time range.
        
        Args:
            range_param: Time range identifier
            start_date: Custom start date (optional)
            end_date: Custom end date (optional)
            user: Filter by specific user (optional)
            
        Returns:
            Dictionary containing all dashboard metrics
        """
        start_time, end_time, grain = cls.parse_time_range(range_param, start_date, end_date)
        
        # Base queryset filtered by time range
        base_qs = RequestLog.objects.filter(
            created_at__gte=start_time,
            created_at__lte=end_time
        )
        
        if user:
            base_qs = base_qs.filter(user=user)
        
        return {
            'range': range_param,
            'generatedAt': timezone.now().isoformat(),
            'requests': cls._get_requests_over_time(base_qs, grain),
            'errorsBreakdown': cls._get_errors_breakdown(base_qs),
            'topModels': cls._get_top_models(base_qs),
            'costs': cls._get_costs_over_time(base_qs, grain),
            'topCountries': cls._get_top_countries(base_qs),
            'latency': cls._get_latency_over_time(base_qs, grain),
            'summary': cls._get_summary_metrics(base_qs),
            'users': cls._get_user_metrics(base_qs, start_time, end_time),
            'feedback': cls._get_feedback_metrics(base_qs),
            'threats': cls._get_threat_metrics(start_time, end_time),
        }
    
    @staticmethod
    def _get_requests_over_time(queryset, grain: str) -> List[Dict[str, Any]]:
        """Get request counts over time (success vs error)."""
        trunc_func = TruncHour('created_at') if grain == 'hour' else TruncDay('created_at')
        
        results = (
            queryset
            .annotate(period=trunc_func)
            .values('period')
            .annotate(
                success=Count(Case(When(status_code__lt=400, then=1))),
                error=Count(Case(When(status_code__gte=400, then=1)))
            )
            .order_by('period')
        )
        
        return [
            {
                'timestamp': result['period'].isoformat(),
                'success': result['success'],
                'error': result['error']
            }
            for result in results
        ]
    
    @staticmethod
    def _get_errors_breakdown(queryset) -> List[Dict[str, Any]]:
        """Get breakdown of error types by status code."""
        results = (
            queryset
            .filter(status_code__gte=400)
            .values('status_code')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]  # Top 10 error codes
        )
        
        return [
            {
                'label': str(result['status_code']),
                'value': result['count']
            }
            for result in results
        ]
    
    @staticmethod
    def _get_top_models(queryset) -> List[Dict[str, Any]]:
        """Get most used AI models."""
        results = (
            queryset
            .exclude(model_name='')
            .values('model_name')
            .annotate(requests=Count('id'))
            .order_by('-requests')[:10]  # Top 10 models
        )
        
        return [
            {
                'name': result['model_name'],
                'requests': result['requests']
            }
            for result in results
        ]
    
    @staticmethod
    def _get_costs_over_time(queryset, grain: str) -> List[Dict[str, Any]]:
        """Get costs over time."""
        trunc_func = TruncHour('created_at') if grain == 'hour' else TruncDay('created_at')
        
        results = (
            queryset
            .exclude(cost_usd__isnull=True)
            .annotate(period=trunc_func)
            .values('period')
            .annotate(cost=Sum('cost_usd'))
            .order_by('period')
        )
        
        return [
            {
                'timestamp': result['period'].isoformat(),
                'cost': float(result['cost'] or 0)
            }
            for result in results
        ]
    
    @staticmethod
    def _get_top_countries(queryset) -> List[Dict[str, Any]]:
        """Get top countries by request count."""
        results = (
            queryset
            .exclude(country_code='')
            .values('country_code')
            .annotate(requests=Count('id'))
            .order_by('-requests')[:10]  # Top 10 countries
        )
        
        # Convert country codes to full names (basic mapping)
        country_names = {
            'US': 'United States (US)',
            'ID': 'Indonesia (ID)',
            'IN': 'India (IN)',
            'GB': 'United Kingdom (GB)',
            'CA': 'Canada (CA)',
            'DE': 'Germany (DE)',
            'FR': 'France (FR)',
            'JP': 'Japan (JP)',
            'BR': 'Brazil (BR)',
            'AU': 'Australia (AU)',
        }
        
        return [
            {
                'name': country_names.get(result['country_code'], f"Unknown ({result['country_code']})"),
                'requests': result['requests']
            }
            for result in results
        ]
    
    @staticmethod
    def _get_latency_over_time(queryset, grain: str) -> List[Dict[str, Any]]:
        """Get average latency over time."""
        trunc_func = TruncHour('created_at') if grain == 'hour' else TruncDay('created_at')
        
        results = (
            queryset
            .annotate(period=trunc_func)
            .values('period')
            .annotate(latency=Avg('latency_ms'))
            .order_by('period')
        )
        
        return [
            {
                'timestamp': result['period'].isoformat(),
                'latency': round(float(result['latency'] or 0) / 1000, 3)  # Convert to seconds
            }
            for result in results
        ]
    
    @staticmethod
    def _get_summary_metrics(queryset) -> Dict[str, Any]:
        """Get summary metrics for the time period."""
        summary = queryset.aggregate(
            total_requests=Count('id'),
            successful_requests=Count(Case(When(status_code__lt=400, then=1))),
            avg_latency_ms=Avg('latency_ms'),
            total_cost=Sum('cost_usd'),
            sum_total_tokens=Sum('total_tokens'),
        )
        
        # Calculate average tokens per request separately to avoid aggregate conflicts
        avg_tokens = 0
        if summary['total_requests'] and summary['sum_total_tokens']:
            avg_tokens = summary['sum_total_tokens'] / summary['total_requests']
        
        return {
            'totalRequests': summary['total_requests'] or 0,
            'successfulRequests': summary['successful_requests'] or 0,
            'avgLatencyMs': round(summary['avg_latency_ms'] or 0, 2),
            'totalCost': float(summary['total_cost'] or 0),
            'totalTokens': summary['sum_total_tokens'] or 0,
            'avgTokensPerRequest': round(avg_tokens, 2),
            'avgCostPerRequest': round(float(summary['total_cost'] or 0) / max(summary['total_requests'] or 1, 1), 6),
        }
    
    @staticmethod
    def _get_user_metrics(queryset, start_time, end_time) -> Dict[str, Any]:
        """Get user activity metrics."""
        active_users = queryset.values('user').distinct().count()
        
        # Get session data
        sessions = UserSession.objects.filter(
            session_start__gte=start_time,
            session_start__lte=end_time
        ).aggregate(
            total_sessions=Count('id'),
            avg_session_cost=Avg('total_cost'),
            avg_session_requests=Avg('total_requests')
        )
        
        return {
            'activeUsers': active_users,
            'totalSessions': sessions['total_sessions'] or 0,
            'avgSessionCost': float(sessions['avg_session_cost'] or 0),
            'avgSessionRequests': round(sessions['avg_session_requests'] or 0, 2),
        }
    
    @staticmethod
    def _get_feedback_metrics(queryset) -> Dict[str, Any]:
        """Get user feedback metrics."""
        # Get feedback for requests in the time period
        request_ids = queryset.values_list('id', flat=True)
        feedback = FeedbackLog.objects.filter(request_log_id__in=request_ids)
        
        feedback_summary = feedback.aggregate(
            total_feedback=Count('id'),
            avg_rating=Avg('rating'),
            rating_5=Count(Case(When(rating=5, then=1))),
            rating_4=Count(Case(When(rating=4, then=1))),
            rating_3=Count(Case(When(rating=3, then=1))),
            rating_2=Count(Case(When(rating=2, then=1))),
            rating_1=Count(Case(When(rating=1, then=1))),
        )
        
        return {
            'totalFeedback': feedback_summary['total_feedback'] or 0,
            'avgRating': round(feedback_summary['avg_rating'] or 0, 2),
            'ratingDistribution': {
                '5': feedback_summary['rating_5'] or 0,
                '4': feedback_summary['rating_4'] or 0,
                '3': feedback_summary['rating_3'] or 0,
                '2': feedback_summary['rating_2'] or 0,
                '1': feedback_summary['rating_1'] or 0,
            }
        }
    
    @staticmethod
    def _get_threat_metrics(start_time, end_time) -> Dict[str, Any]:
        """Get security threat metrics."""
        threats = ThreatLog.objects.filter(
            created_at__gte=start_time,
            created_at__lte=end_time
        )
        
        threat_summary = threats.aggregate(
            total_threats=Count('id'),
            unresolved_threats=Count(Case(When(resolved=False, then=1))),
            critical_threats=Count(Case(When(severity='critical', then=1))),
            high_threats=Count(Case(When(severity='high', then=1))),
        )
        
        threat_types = threats.values('threat_type').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        return {
            'totalThreats': threat_summary['total_threats'] or 0,
            'unresolvedThreats': threat_summary['unresolved_threats'] or 0,
            'criticalThreats': threat_summary['critical_threats'] or 0,
            'highThreats': threat_summary['high_threats'] or 0,
            'topThreatTypes': [
                {
                    'type': threat['threat_type'],
                    'count': threat['count']
                }
                for threat in threat_types
            ]
        } 