# Dashboard Analytics System

## Overview

The dashboard system provides comprehensive real-time analytics for the AI Studio platform. It automatically tracks all API requests, user sessions, feedback, and security events through a sophisticated 5-table database schema.

## Database Schema

### Core Models

#### 1. RequestLog
**Purpose**: Central logging table for all API requests  
**Key Features**:
- Automatic request timing and latency tracking
- AI model usage and token consumption
- Cost calculation and attribution
- Geographic data via IP address
- User authentication status
- Status codes and error tracking

**Indexes**: `created_at`, `model_name`, `user + created_at`, `status_code`, `endpoint`

#### 2. UserSession
**Purpose**: Session analytics and user activity tracking  
**Key Features**:
- Session duration and activity patterns
- Aggregated metrics per session (requests, cost, tokens)
- IP address and user agent tracking
- Session start/end timestamps

**Indexes**: `session_start`, `user + session_start`

#### 3. FeedbackLog
**Purpose**: User feedback and rating system  
**Key Features**:
- 5-star rating system for AI responses
- Optional feedback text
- Linked to specific requests
- Prevents duplicate ratings per user/request

**Indexes**: `created_at`, `rating`, `request_log`

#### 4. ThreatLog
**Purpose**: Security monitoring and threat detection  
**Key Features**:
- Multiple threat types (rate limiting, suspicious content, etc.)
- Severity levels (low, medium, high, critical)
- Resolution tracking with timestamps
- Geographic and network context

**Indexes**: `created_at`, `threat_type`, `severity`, `resolved`

#### 5. ModelUsageStats
**Purpose**: Daily aggregated statistics for performance  
**Key Features**:
- Pre-computed daily metrics per model
- Success/failure rates
- Performance statistics (latency, tokens, cost)
- Optimized for fast dashboard queries

**Indexes**: `date`, `model_name + date`

## API Endpoints

### GET /api/dashboard/
**Purpose**: Main dashboard data endpoint  
**Parameters**:
- `range`: Time range (`24h`, `7d`, `1m`, `3m`, `custom`)
- `start`: ISO date string (for custom range)
- `end`: ISO date string (for custom range)

**Response Structure**:
```json
{
  "range": "7d",
  "generatedAt": "2025-07-20T22:30:00Z",
  "requests": [...],           // Request volume over time
  "errorsBreakdown": [...],    // Error types by status code
  "topModels": [...],          // Most used AI models
  "costs": [...],              // Cost tracking over time
  "topCountries": [...],       // Geographic analytics
  "latency": [...],            // Performance metrics
  "summary": {...},            // Aggregated summary stats
  "users": {...},              // User activity metrics
  "feedback": {...},           // Rating and feedback stats
  "threats": {...}             // Security monitoring
}
```

### GET /api/dashboard/health/
**Purpose**: System health check  
**Returns**: Database connectivity and basic metrics

## Automatic Request Tracking

### RequestLoggingMiddleware
All API requests are automatically logged through Django middleware that captures:

- **Timing**: Request processing time in milliseconds
- **AI Metrics**: Model name, token usage, costs, finish reason
- **Network**: IP address, user agent, geographic data
- **Authentication**: User context and session info
- **Performance**: Latency and response status

### Geographic Data
- IP-based country detection (optional GeoIP2 integration)
- Privacy-aware for local/development IPs
- Graceful fallback when GeoIP data unavailable

## Frontend Integration

### React Query Hook
```typescript
const { data, isLoading, error } = useDashboardData('7d');
```

### Real-time Updates
- 30-second refresh interval for live data
- 15-second stale time for optimal performance
- Automatic error handling and retry logic

### Component Structure
```
DashboardPage
├── DashboardHeader (time range selection)
└── DashboardGrid
    ├── MetricCard components (summary stats)
    ├── RequestsChartCard (volume over time)
    ├── ErrorsDonutCard (error breakdown)
    ├── TopModelsCard (model popularity)
    ├── CostsBarCard (cost tracking)
    ├── LatencyChartCard (performance)
    └── ... (additional analytics cards)
```

## Django Admin Interface

### Features
- **RequestLog**: Enhanced list view with computed latency display
- **UserSession**: Duration calculations and activity summaries
- **FeedbackLog**: Star rating displays and feedback previews
- **ThreatLog**: Color-coded severity indicators and bulk resolution actions
- **ModelUsageStats**: Performance metrics and success rate calculations

### Admin Actions
- Mark threats as resolved/unresolved (bulk operations)
- Export data for external analysis
- User activity investigation tools

## Performance Optimization

### Database Indexes
Strategic indexing on commonly queried fields:
- Time-based queries (`created_at`)
- User-specific filtering (`user + created_at`)
- Categorical analysis (`model_name`, `status_code`)
- Performance queries (`latency_ms`, `cost_usd`)

### Query Optimization
- Efficient Django ORM aggregations
- Computed fields to avoid N+1 queries
- Separate aggregation calculations to prevent conflicts
- Pre-computed daily stats for large datasets

### Caching Strategy
- React Query client-side caching (15-second stale time)
- Future: Redis server-side caching for expensive aggregations
- Future: Pre-computed daily summaries via Celery tasks

## Development Commands

### Data Population
```bash
# Generate realistic test data
python manage.py populate_dashboard_data --days=14 --users=3

# Clear existing data
python manage.py populate_dashboard_data --clear --days=7
```

### Database Operations
```bash
# Apply migrations
python manage.py migrate

# Access admin interface
python manage.py createsuperuser
# Visit: http://localhost:8000/admin/
```

## Security Considerations

### Threat Detection
- Rate limiting violations
- Suspicious content patterns
- Invalid authentication attempts
- Malformed requests
- Potential prompt injection

### Data Privacy
- IP address anonymization options
- User data access controls
- Audit trail for administrative actions
- Secure token handling in logs

### Access Control
- Admin interface requires authentication
- API endpoints require JWT tokens
- User-specific data filtering
- Role-based permissions (future)

## Monitoring & Alerts

### Current Capabilities
- Real-time threat detection
- Performance degradation tracking
- Error rate monitoring
- Cost anomaly detection

### Future Enhancements
- Email/Slack alerts for critical events
- Automated threat response
- Performance baseline establishment
- Predictive analytics for usage patterns

## API Integration Guide

### Adding Request Tracking to New Endpoints
Request tracking is automatic via middleware, but for AI-specific metrics:

```python
from dashboard.middleware import TokenUsageTracker

# In your view, after processing AI request:
TokenUsageTracker.log_chat_completion(
    request=request,
    model_name=model_name,
    usage_data={
        'prompt_tokens': prompt_tokens,
        'completion_tokens': completion_tokens,
        'total_tokens': total_tokens
    },
    cost_usd=calculated_cost,
    finish_reason=finish_reason
)
```

### Adding Custom Threat Detection
```python
from dashboard.models import ThreatLog

ThreatLog.objects.create(
    threat_type='custom_threat',
    severity='medium',
    ip_address=request.META.get('REMOTE_ADDR'),
    description='Custom threat detected',
    user=request.user if request.user.is_authenticated else None
)
```

## Testing

### Mock Data Generation
The `populate_dashboard_data` command creates realistic test data:
- **Request patterns**: Business hours activity simulation
- **Model distribution**: Realistic usage patterns across different AI models
- **Geographic diversity**: Multiple countries with weighted distribution
- **Error scenarios**: Various HTTP status codes with realistic frequency
- **Security events**: Threat logs with different severity levels
- **User feedback**: Rating distribution skewed toward positive

### Validation
- Database constraint testing
- API response format validation
- Performance benchmarking with large datasets
- Frontend integration testing
- Error handling verification

## Future Roadmap

### Short Term
1. **Grid Layout Improvements**: Better responsive design and component arrangement
2. **Additional Charts**: More visualization types for different metrics
3. **Export Functionality**: CSV/JSON data export for external analysis

### Medium Term
1. **Advanced Filtering**: Date range pickers, user-specific views
2. **Custom Dashboards**: User-configurable dashboard layouts
3. **Alerting System**: Automated notifications for threshold breaches

### Long Term
1. **Machine Learning**: Predictive analytics and anomaly detection
2. **Multi-tenant Support**: Organization-level data separation
3. **Advanced Security**: Automated threat response and mitigation 