from django.contrib import admin
from django.utils.html import format_html
from .models import RequestLog, UserSession, FeedbackLog, ThreatLog, ModelUsageStats


@admin.register(RequestLog)
class RequestLogAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'endpoint', 'method', 'status_code', 
        'latency_display', 'model_name', 'user', 'cost_usd'
    ]
    list_filter = [
        'endpoint', 'method', 'status_code', 'model_name', 
        'created_at', 'country_code'
    ]
    search_fields = ['endpoint', 'model_name', 'user__username', 'ip_address']
    readonly_fields = ['created_at', 'latency_ms', 'ip_address', 'user_agent']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def latency_display(self, obj):
        """Display latency in a readable format."""
        if obj.latency_ms:
            if obj.latency_ms < 1000:
                return f"{obj.latency_ms:.0f}ms"
            else:
                return f"{obj.latency_ms/1000:.2f}s"
        return "-"
    latency_display.short_description = "Latency"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'session_start', 'session_end', 'duration_display',
        'total_requests', 'total_cost', 'total_tokens'
    ]
    list_filter = ['session_start', 'session_end']
    search_fields = ['user__username', 'ip_address']
    readonly_fields = ['session_start', 'ip_address', 'user_agent']
    date_hierarchy = 'session_start'
    ordering = ['-session_start']
    
    def duration_display(self, obj):
        """Display session duration."""
        if obj.session_end:
            duration = obj.session_end - obj.session_start
            hours = duration.total_seconds() // 3600
            minutes = (duration.total_seconds() % 3600) // 60
            return f"{hours:.0f}h {minutes:.0f}m"
        return "Active"
    duration_display.short_description = "Duration"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(FeedbackLog)
class FeedbackLogAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'user', 'rating', 'rating_display', 
        'request_model', 'feedback_preview'
    ]
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'feedback_text', 'request_log__model_name']
    readonly_fields = ['created_at', 'request_log', 'user']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def rating_display(self, obj):
        """Display rating with stars."""
        stars = "⭐" * obj.rating
        return format_html(f'<span title="{obj.get_rating_display()}">{stars}</span>')
    rating_display.short_description = "Rating"
    
    def request_model(self, obj):
        """Display the model name from the related request."""
        return obj.request_log.model_name or "-"
    request_model.short_description = "Model"
    
    def feedback_preview(self, obj):
        """Display a preview of the feedback text."""
        if obj.feedback_text:
            return obj.feedback_text[:50] + "..." if len(obj.feedback_text) > 50 else obj.feedback_text
        return "-"
    feedback_preview.short_description = "Feedback Preview"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'request_log')


@admin.register(ThreatLog)
class ThreatLogAdmin(admin.ModelAdmin):
    list_display = [
        'created_at', 'threat_type', 'severity', 'severity_display',
        'ip_address', 'user', 'resolved', 'resolved_display'
    ]
    list_filter = [
        'threat_type', 'severity', 'resolved', 'created_at', 'country_code'
    ]
    search_fields = ['threat_type', 'ip_address', 'user__username', 'description']
    readonly_fields = ['created_at', 'ip_address', 'user_agent', 'raw_data']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    actions = ['mark_resolved', 'mark_unresolved']
    
    def severity_display(self, obj):
        """Display severity with color coding."""
        colors = {
            'low': '#28a745',      # Green
            'medium': '#ffc107',   # Yellow  
            'high': '#fd7e14',     # Orange
            'critical': '#dc3545'  # Red
        }
        color = colors.get(obj.severity, '#6c757d')
        return format_html(
            f'<span style="color: {color}; font-weight: bold;">{obj.get_severity_display()}</span>'
        )
    severity_display.short_description = "Severity"
    
    def resolved_display(self, obj):
        """Display resolution status with icons."""
        if obj.resolved:
            return format_html('<span style="color: #28a745;">✅ Resolved</span>')
        else:
            return format_html('<span style="color: #dc3545;">❌ Open</span>')
    resolved_display.short_description = "Status"
    
    def mark_resolved(self, request, queryset):
        """Mark selected threats as resolved."""
        from django.utils import timezone
        updated = queryset.update(
            resolved=True, 
            resolved_at=timezone.now(),
            resolved_by=request.user
        )
        self.message_user(request, f"{updated} threats marked as resolved.")
    mark_resolved.short_description = "Mark selected threats as resolved"
    
    def mark_unresolved(self, request, queryset):
        """Mark selected threats as unresolved."""
        updated = queryset.update(
            resolved=False,
            resolved_at=None,
            resolved_by=None
        )
        self.message_user(request, f"{updated} threats marked as unresolved.")
    mark_unresolved.short_description = "Mark selected threats as unresolved"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'resolved_by')


@admin.register(ModelUsageStats)
class ModelUsageStatsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'model_name', 'total_requests', 'success_rate',
        'total_tokens', 'total_cost', 'avg_latency_display'
    ]
    list_filter = ['date', 'model_name']
    search_fields = ['model_name']
    readonly_fields = ['date', 'model_name']
    date_hierarchy = 'date'
    ordering = ['-date', 'model_name']
    
    def success_rate(self, obj):
        """Calculate and display success rate."""
        if obj.total_requests > 0:
            rate = (obj.successful_requests / obj.total_requests) * 100
            return f"{rate:.1f}%"
        return "0%"
    success_rate.short_description = "Success Rate"
    
    def avg_latency_display(self, obj):
        """Display average latency in readable format."""
        if obj.avg_latency_ms:
            if obj.avg_latency_ms < 1000:
                return f"{obj.avg_latency_ms:.0f}ms"
            else:
                return f"{obj.avg_latency_ms/1000:.2f}s"
        return "-"
    avg_latency_display.short_description = "Avg Latency"


# Customize admin site headers
admin.site.site_header = "AI Studio Dashboard Admin"
admin.site.site_title = "Dashboard Admin"
admin.site.index_title = "Dashboard Management"
