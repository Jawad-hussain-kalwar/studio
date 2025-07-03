# 🔧 Backend Implementation Overview & Project Structure

## Architecture Summary
```
studio/
├── studio-frontend/     # React + Vite (✅ Complete)
├── studio-backend/      # Django REST API (🚧 To Build)
│   ├── manage.py
│   ├── requirements.txt
│   ├── studio_backend/  # Main Django project
│   │   ├── __init__.py
│   │   ├── settings/    # Environment-specific settings
│   │   ├── urls.py      # Root URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py      # For async/WebSocket support
│   ├── apps/            # Django apps (modular organization)
│   │   ├── __init__.py
│   │   ├── authentication/  # User auth & OAuth
│   │   ├── chat/           # Chat completions & sessions
│   │   ├── models/         # Model management
│   │   ├── images/         # Image generation
│   │   ├── api_keys/       # API key management
│   │   ├── dashboard/      # Dashboard data (future)
│   │   └── core/           # Shared utilities
│   ├── middleware/      # Custom middleware
│   ├── serializers/     # DRF serializers (camelCase)
│   ├── utils/           # Shared utilities
│   ├── tests/           # Test organization
│   └── static/          # Static files
├── inference/           # LLM/Image serving (🔄 Separate)
└── plans/               # Requirements docs
```

## 🚨 CRITICAL FRONTEND REALITY CHECK

After detailed analysis of the frontend code, several key discoveries impact backend requirements:

### Authentication Reality
- **JWT Storage**: Frontend uses `localStorage` NOT HTTP-only cookies!
- **Token Format**: Must return access token in response body for localStorage
- **Bearer Auth**: `Authorization: Bearer <token>` header format required
- **Auto-redirect**: 401 responses trigger automatic redirect to `/signin`

### Feature Implementation Status
- **Dashboard**: Just placeholder "Coming Soon" text - no functionality
- **History**: Navigation exists but leads to "Coming Soon" page
- **API Keys**: Button exists but no modal or management UI
- **Image Generation**: UI-only, no actual API calls to backend
- **Models**: Hardcoded arrays in frontend, no API calls yet

### Response Format Requirements
- **MUST USE camelCase** - Frontend expects `createdAt`, `contextLength`, `promptTokens`, etc.
- **NOT snake_case** - Backend plans originally had wrong format
- **Streaming format** - Server-Sent Events for chat completions

## Django Project Structure & Organization

### 🏗️ Project Layout (Following Django Best Practices)

```
studio-backend/
├── manage.py                        # Django management script
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── pytest.ini                      # Test configuration
├── pyproject.toml                   # Python project configuration
├── studio_backend/                  # Main Django project directory
│   ├── __init__.py
│   ├── settings/                    # Environment-specific settings
│   │   ├── __init__.py
│   │   ├── base.py                  # Base settings
│   │   ├── development.py           # Development overrides
│   │   ├── production.py            # Production configuration
│   │   └── testing.py               # Test environment settings
│   ├── urls.py                      # Root URL configuration
│   ├── wsgi.py                      # WSGI application
│   └── asgi.py                      # ASGI application (for async)
├── apps/                            # Django applications
│   ├── __init__.py
│   ├── authentication/              # User authentication & OAuth
│   │   ├── __init__.py
│   │   ├── models.py                # User profile extensions
│   │   ├── views.py                 # Auth views (login, register, OAuth)
│   │   ├── serializers.py           # camelCase auth serializers
│   │   ├── urls.py                  # Auth URL patterns
│   │   ├── permissions.py           # Custom permissions
│   │   ├── oauth_handlers.py        # Google/Apple OAuth logic
│   │   ├── tokens.py                # JWT token management
│   │   └── migrations/              # Database migrations
│   ├── chat/                        # Chat system
│   │   ├── __init__.py
│   │   ├── models.py                # ChatSession, ChatMessage
│   │   ├── views.py                 # Chat API views
│   │   ├── serializers.py           # Chat serializers (camelCase)
│   │   ├── urls.py                  # Chat URL patterns
│   │   ├── streaming.py             # SSE streaming logic
│   │   ├── inference_client.py      # Inference service client
│   │   ├── token_counter.py         # Token estimation
│   │   └── migrations/
│   ├── models/                      # Model management
│   │   ├── __init__.py
│   │   ├── models.py                # Model metadata
│   │   ├── views.py                 # Model listing views
│   │   ├── serializers.py           # Model serializers
│   │   ├── urls.py                  # Model URL patterns
│   │   └── static_config.py         # Hardcoded model definitions
│   ├── images/                      # Image generation
│   │   ├── __init__.py
│   │   ├── models.py                # GeneratedImage model
│   │   ├── views.py                 # Image generation views
│   │   ├── serializers.py           # Image serializers
│   │   ├── urls.py                  # Image URL patterns
│   │   ├── inference_client.py      # Image inference client
│   │   ├── image_processing.py      # Image processing utilities
│   │   └── migrations/
│   ├── api_keys/                    # API key management
│   │   ├── __init__.py
│   │   ├── models.py                # ApiKey model
│   │   ├── views.py                 # API key CRUD views
│   │   ├── serializers.py           # API key serializers
│   │   ├── urls.py                  # API key URL patterns
│   │   ├── authentication.py        # API key auth backend
│   │   └── migrations/
│   ├── dashboard/                   # Dashboard data (future)
│   │   ├── __init__.py
│   │   ├── models.py                # UserStats model
│   │   ├── views.py                 # Dashboard views
│   │   ├── serializers.py           # Dashboard serializers
│   │   ├── urls.py                  # Dashboard URL patterns
│   │   └── migrations/
│   └── core/                        # Shared utilities
│       ├── __init__.py
│       ├── models.py                # Abstract base models
│       ├── permissions.py           # Global permissions
│       ├── pagination.py            # Custom pagination
│       ├── exceptions.py            # Custom exceptions
│       ├── validators.py            # Input validators
│       └── utils.py                 # Utility functions
├── middleware/                      # Custom middleware
│   ├── __init__.py
│   ├── auth_middleware.py           # JWT + API key authentication
│   ├── cors_middleware.py           # Enhanced CORS handling
│   ├── rate_limiting.py             # Rate limiting middleware
│   └── camelcase_middleware.py      # camelCase response conversion
├── serializers/                     # Global serializers
│   ├── __init__.py
│   ├── base.py                      # Base camelCase serializer
│   └── mixins.py                    # Serializer mixins
├── utils/                           # Shared utilities
│   ├── __init__.py
│   ├── camelcase.py                 # camelCase conversion utilities
│   ├── inference_client.py          # Base inference client
│   ├── security.py                  # Security utilities
│   └── validators.py                # Shared validators
├── tests/                           # Test organization
│   ├── __init__.py
│   ├── test_authentication/         # Auth tests
│   ├── test_chat/                   # Chat tests
│   ├── test_models/                 # Model tests
│   ├── test_images/                 # Image tests
│   ├── test_api_keys/               # API key tests
│   ├── fixtures/                    # Test fixtures
│   └── utils.py                     # Test utilities
└── static/                          # Static files
    ├── admin/                       # Django admin static files
    └── api/                         # API documentation assets
```

### 🔧 Key Architectural Decisions

#### 1. **App Organization Strategy**
- **Domain-driven design**: Each app represents a business domain
- **Loose coupling**: Apps communicate through well-defined interfaces
- **Single responsibility**: Each app has one clear purpose
- **Maximum 300 lines per file**: Following project rules

#### 2. **Settings Architecture**
```python
# studio_backend/settings/base.py - Core settings
# studio_backend/settings/development.py - Dev overrides  
# studio_backend/settings/production.py - Production config
# studio_backend/settings/testing.py - Test environment

# Environment selection via DJANGO_SETTINGS_MODULE
```

#### 3. **URL Structure**
```python
# Root URLs (studio_backend/urls.py)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/images/', include('apps.images.urls')),
    path('api/keys/', include('apps.api_keys.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('v1/models', include('apps.models.urls')),
    path('v1/chat/', include('apps.chat.urls')),
    path('v1/images/', include('apps.images.urls')),
]
```

#### 4. **Database Architecture**
```python
# Abstract base models in apps/core/models.py
class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    
    class Meta:
        abstract = True
```

#### 5. **camelCase Response Handling**
```python
# serializers/base.py - Base camelCase serializer
class CamelCaseModelSerializer(ModelSerializer):
    """Base serializer that converts field names to camelCase"""
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return camelcase_transform(data)
```

#### 6. **Authentication Architecture**
```python
# Multiple authentication backends
AUTHENTICATION_BACKENDS = [
    'apps.authentication.backends.JWTAuthentication',
    'apps.api_keys.authentication.ApiKeyAuthentication',
    'django.contrib.auth.backends.ModelBackend',
]
```

#### 7. **Middleware Stack**
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'middleware.rate_limiting.RateLimitMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'middleware.auth_middleware.MultiAuthMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'middleware.camelcase_middleware.CamelCaseMiddleware',
]
```

## Requirements Files Breakdown

### 🔐 [backend-auth.md](./backend-auth.md) - Authentication (CONSOLIDATED)
- OAuth (Google, Apple) + email/password registration with camelCase responses
- **JWT in localStorage** with token blacklisting and refresh rotation
- Enhanced security: rate limiting, input validation, CSRF protection
- **Key endpoints**: `/api/auth/*` (login, register, oauth flows, logout, me)
- **Priority**: HIGH - Core functionality with security hardening

### 💬 [backend-chat.md](./backend-chat.md) - Chat System (UPDATED)
- **No session persistence initially** - frontend uses local state only
- Streaming proxy to inference service (core feature)
- **camelCase response format** required
- **Key endpoints**: `/v1/chat/completions` (priority), `/api/chat/sessions/*` (future)
- **Priority**: HIGH - Core chat functionality

### 🤖 [backend-models.md](./backend-models.md) - Model Management (UPDATED)
- **Frontend has hardcoded models** - API not used yet
- **camelCase `contextLength`** required when API gets implemented
- Static configuration to match frontend exactly
- **Key endpoints**: `/v1/models` (future - not used yet)
- **Priority**: MEDIUM - When frontend removes hardcoded models

### 🎨 [backend-images.md](./backend-images.md) - Image Generation (UPDATED)
- **Frontend makes no image API calls** - UI only currently
- **No history UI exists** - no image management interface
- **Canvas shows placeholder** - no actual generation
- **Key endpoints**: `/v1/images/generations` (future - not used yet)
- **Priority**: LOW - Frontend needs implementation first

### 🔑 [backend-api-keys.md](./backend-api-keys.md) - API Keys (UPDATED)  
- **Button exists but no modal** - no UI for showing generated keys
- **No key management interface** - simple generation only
- **camelCase response format** when implemented
- **Key endpoints**: `/api/keys/*` (future - no UI exists)
- **Priority**: LOW - Frontend needs modal implementation

### 📊 [backend-dashboard.md](./backend-dashboard.md) - Dashboard (UPDATED)
- **Complete placeholder** - no functionality, just "Coming Soon" text
- **No API calls** - frontend doesn't request any data
- **Key endpoints**: `/api/dashboard/*` (not needed yet)
- **Priority**: SKIP - No implementation needed

## Technology Stack
```python
# Core framework
Django==5.0+
djangorestframework==3.14+
django-cors-headers==4.5+

# Authentication (localStorage compatible)
djangorestframework-simplejwt==5.3+
python-social-auth[django]==1.7+

# Database
psycopg2-binary==2.9+  # PostgreSQL
django-extensions==3.2+

# Async HTTP clients
httpx==0.25+  # For async requests to inference service
aiohttp==3.9+

# Image processing
Pillow==10.0+

# Caching & rate limiting
redis==5.0+
django-redis==5.4+
django-ratelimit==4.1+

# Development & testing
pytest-django==4.8+
factory-boy==3.3+
freezegun==1.2+

# Code quality
black==23.12+
isort==5.13+
flake8==7.0+
mypy==1.8+
```

## Database Models Summary
- **User** (Django built-in) + **UserProfile** (OAuth data)
- **ChatSession** + **ChatMessage** (future - for when history gets implemented)
- **GeneratedImage** (future - for when image generation gets implemented)
- **ApiKey** (future - for when UI gets implemented)
- **UserStats** (future - for when dashboard gets implemented)
- **UsageRecord** (basic token tracking for display)

## Development Guidelines

### 🎯 Code Organization Principles
1. **Keep files under 300 lines** - Split into smaller modules if needed
2. **Single responsibility principle** - Each class/function has one purpose
3. **Domain-driven design** - Group related functionality into apps
4. **DRY principle** - Shared code goes in `apps/core/` or `utils/`
5. **Clear imports** - Use absolute imports for clarity

### 🧪 Testing Strategy
```python
# Test structure mirrors app structure
tests/
├── test_authentication/
│   ├── test_models.py
│   ├── test_views.py
│   ├── test_serializers.py
│   └── test_oauth.py
├── test_chat/
│   ├── test_models.py
│   ├── test_views.py
│   ├── test_streaming.py
│   └── test_inference_client.py
```

### 🔒 Security Architecture
```python
# Security middleware stack
- Rate limiting per user/IP
- CORS configuration for frontend
- JWT token blacklisting
- API key authentication
- Input validation & sanitization
- SQL injection protection (Django ORM)
- XSS protection headers
```

## REVISED Implementation Priority

### Phase 1: Core Infrastructure (IMMEDIATE)
1. **Django project setup** - Settings, apps, basic structure
2. **Authentication system** - OAuth + JWT (localStorage format)
3. **Core utilities** - camelCase serializers, middleware
4. **Chat completions proxy** - `/v1/chat/completions` streaming

### Phase 2: API Completion (WHEN FRONTEND ADDS FEATURES)
5. **Models endpoint** - Static models list (when frontend needs it)
6. **Chat sessions** - When History page gets implemented
7. **Image generation** - When frontend adds API calls
8. **API key generation** - When frontend adds modal

### Phase 3: Management Features (FUTURE)
9. **Dashboard endpoints** - When frontend adds actual dashboard
10. **Advanced features** - Based on frontend development
11. **Performance optimization** - Caching, database tuning
12. **Monitoring & logging** - Production readiness

## Environment Variables Needed
```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/studio_db

# OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
APPLE_OAUTH_CLIENT_ID=
APPLE_OAUTH_CLIENT_SECRET=

# JWT (localStorage compatible)
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080

# Inference service
INFERENCE_SERVICE_URL=http://localhost:8001
INFERENCE_SERVICE_API_KEY=

# Frontend
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Redis (for caching & rate limiting)
REDIS_URL=redis://localhost:6379/0

# File storage (for images)
MEDIA_ROOT=media/
MEDIA_URL=/media/
```

## Key Frontend Compatibility Requirements
- **JWT tokens in response body** for localStorage storage with blacklisting support
- **camelCase JSON responses** for all API endpoints (firstName, createdAt, etc.)
- **Match hardcoded frontend models** exactly in static configuration
- **Streaming SSE format** for chat completions matching frontend parser
- **Enhanced auth security** with rate limiting, input validation, and token rotation
- **Bearer token authentication** in Authorization header

## Critical Implementation Notes
- **Start with stateless chat proxy** - frontend handles UI state locally
- **Match frontend exactly** - don't add features that don't exist in UI
- **camelCase all responses** - frontend expects this format consistently
- **Skip placeholder features** - dashboard, history, etc. until frontend implements UI
- **Focus on working features** - chat and auth are the only fully functional parts
- **Modular architecture** - each app is independent and reusable
- **Clean separation** - API logic separate from business logic

## Quality Assurance

### 🔍 Code Quality Tools
```bash
# Code formatting
black studio_backend/
isort studio_backend/

# Linting
flake8 studio_backend/
mypy studio_backend/

# Testing
pytest tests/
pytest --cov=apps tests/
```

### 📊 Performance Monitoring
- Database query optimization
- API response time monitoring
- Memory usage tracking
- Rate limiting effectiveness

## Next Steps
1. Set up Django project with modular app structure
2. Implement authentication system with JWT localStorage compatibility
3. Create chat completions proxy with streaming SSE support
4. Add camelCase response middleware and serializers
5. Implement basic models endpoint (when frontend needs it)
6. Skip unimplemented features until frontend catches up

Each requirements file reflects actual frontend reality, not assumptions about what "should" exist. The architecture prioritizes maintainability, testability, and frontend compatibility while following Django best practices. 