from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from datetime import datetime
import logging

from .services import DashboardService

logger = logging.getLogger(__name__)


class DashboardAPIView(APIView):
    """
    API endpoint for dashboard data.
    Returns aggregated metrics for the specified time range.
    
    Query Parameters:
    - range: '24h', '7d', '1m', '3m', 'custom' (default: '7d')
    - start: ISO date string (required for range='custom')
    - end: ISO date string (required for range='custom')
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Parse query parameters
            range_param = request.GET.get('range', '7d')
            start_param = request.GET.get('start')
            end_param = request.GET.get('end')
            
            # Validate range parameter
            valid_ranges = ['24h', '7d', '1m', '3m', 'custom']
            if range_param not in valid_ranges:
                return Response(
                    {'error': f'Invalid range. Must be one of: {", ".join(valid_ranges)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse custom date range if provided
            start_date = None
            end_date = None
            
            if range_param == 'custom':
                if not start_param or not end_param:
                    return Response(
                        {'error': 'start and end parameters are required for custom range'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    start_date = datetime.fromisoformat(start_param.replace('Z', '+00:00'))
                    end_date = datetime.fromisoformat(end_param.replace('Z', '+00:00'))
                except ValueError as e:
                    return Response(
                        {'error': f'Invalid date format: {str(e)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if start_date >= end_date:
                    return Response(
                        {'error': 'start date must be before end date'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Get dashboard data
            dashboard_data = DashboardService.get_dashboard_data(
                range_param=range_param,
                start_date=start_date,
                end_date=end_date,
                user=request.user  # Filter by current user
            )
            
            return Response(dashboard_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Dashboard API error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardHealthView(APIView):
    """
    Health check endpoint for dashboard services.
    Returns basic system status and database connectivity.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            from .models import RequestLog
            
            # Check database connectivity
            recent_logs_count = RequestLog.objects.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=1)
            ).count()
            
            total_logs_count = RequestLog.objects.count()
            
            return Response({
                'status': 'healthy',
                'timestamp': timezone.now().isoformat(),
                'database': {
                    'connected': True,
                    'totalLogs': total_logs_count,
                    'recentLogs': recent_logs_count
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Dashboard health check failed: {str(e)}")
            return Response({
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
