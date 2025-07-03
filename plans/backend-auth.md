# 🔐 Authentication Requirements - Single Source of Truth

## Purpose
Complete authentication system for AI Studio frontend using OAuth (Google/Apple) and email/password registration with JWT tokens.

## 📋 Frontend Reality & Integration Requirements

### Current Frontend Implementation
- **Sign In page**: `src/pages/Public/SignIn.tsx` - Google/Apple OAuth buttons + email/password form
- **Sign Up page**: `src/pages/Public/SignUp.tsx` - Registration form with Name, Email, Password fields  
- **HTTP Client**: `src/api/http.ts` - Axios interceptors for auth headers and 401 handling
- **JWT Storage**: Frontend uses `localStorage.getItem('auth_token')` - NOT HTTP-only cookies
- **Auth Header**: `Authorization: Bearer <token>` format required
- **Response Format**: **MUST use camelCase** (createdAt, firstName, etc.)
- **401 Handling**: Frontend automatically redirects to `/signin` on auth failure

### Critical Integration Points
- Backend MUST return JWT in response body for localStorage storage
- All user data MUST be in camelCase format to match frontend expectations
- OAuth callbacks MUST redirect to frontend with token/error parameters
- Name field in registration gets split into firstName/lastName by backend

## 🔗 Required API Endpoints

| Method | Endpoint | Purpose | Request Body | Success Response |
|--------|----------|---------|--------------|------------------|
| `POST` | `/api/auth/login/` | Email/password login | `{email, password}` | `{access, refresh?, user}` |
| `POST` | `/api/auth/register/` | Email/password registration | `{name, email, password}` | `{access, refresh?, user}` |
| `GET` | `/api/auth/oauth/google/` | Initiate Google OAuth | - | Redirect to Google |
| `GET` | `/api/auth/oauth/google/callback/` | Handle Google callback | - | Redirect to frontend |
| `GET` | `/api/auth/oauth/apple/` | Initiate Apple OAuth | - | Redirect to Apple |
| `GET` | `/api/auth/oauth/apple/callback/` | Handle Apple callback | - | Redirect to frontend |
| `GET` | `/api/auth/me/` | Get current user profile | - | `{user}` |
| `POST` | `/api/auth/logout/` | Logout (blacklist token) | - | `{message}` |

## 🔐 Authentication Flows

### 1. Email/Password Authentication

**Login Request:**
```json
POST /api/auth/login/
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "oauthProvider": "email",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials",
  "message": "Email or password is incorrect"
}
```

### 2. Registration

**Registration Request:**
```json
POST /api/auth/register/
{
  "name": "John Doe",        // Backend splits to firstName/lastName
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (201):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 2,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePicture": null,
    "oauthProvider": "email",
    "createdAt": "2025-01-27T10:00:00Z"
  }
}
```

**Validation Error Response (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Email already exists", "Invalid email format"],
    "password": ["Password too weak"],
    "name": ["Name is required"]
  }
}
```

### 3. OAuth Flow

**Step 1:** Frontend redirects user to OAuth initiation
```javascript
window.location.href = "/api/auth/oauth/google/";
```

**Step 2:** Backend redirects to OAuth provider

**Step 3:** OAuth provider redirects to callback

**Step 4:** Backend processes and redirects to frontend

**Success Redirect:**
```
http://localhost:5173/app?token=<jwt>&user=<base64_user>&newUser=true
```

**Error Redirect:**
```
http://localhost:5173/signin?error=<error_message>
```

## 📊 Database Models

### User Profile Extension
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    oauth_provider = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('google', 'Google'),
        ('apple', 'Apple'),
    ])
    oauth_id = models.CharField(max_length=255, blank=True)
    profile_picture = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['oauth_provider', 'oauth_id']

    def to_camel_case_dict(self):
        """Convert to camelCase format for frontend compatibility"""
        return {
            'id': self.user.id,
            'email': self.user.email,
            'firstName': self.user.first_name,
            'lastName': self.user.last_name,
            'profilePicture': self.profile_picture,
            'oauthProvider': self.oauth_provider,
            'createdAt': self.created_at.isoformat()
        }
```

### Token Blacklist (for logout)
```python
class BlacklistedToken(models.Model):
    jti = models.CharField(max_length=255, unique=True)  # JWT ID
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # When token naturally expires
```

## ⚙️ JWT Configuration

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Reduced for security
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    # Security settings
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': env('JWT_SECRET_KEY'),
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': 'ai-studio-api',
    'JSON_ENCODER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    
    # Token blacklisting
    'CHECK_REVOKE_TOKEN': True,
}
```

## 🛡️ Security Implementation

### Password Validation
```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    # Custom validator for complexity
    {
        'NAME': 'apps.auth.validators.PasswordComplexityValidator',
    },
]
```

### Rate Limiting
```python
RATE_LIMITS = {
    'auth_login': '3/minute',      # Stricter for login attempts
    'auth_register': '5/hour',     # Registration attempts
    'oauth_init': '10/minute',     # OAuth initiation
    'auth_refresh': '10/minute',   # Token refresh
}
```

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend dev server
    "https://studio.yourdomain.com",  # Production frontend
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type", 
    "x-requested-with",
]
```

### Security Headers
```python
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # Production only
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

## 🔑 OAuth Provider Configuration

### Google OAuth
```python
GOOGLE_OAUTH = {
    'client_id': env('GOOGLE_OAUTH_CLIENT_ID'),
    'client_secret': env('GOOGLE_OAUTH_CLIENT_SECRET'),
    'scope': ['openid', 'email', 'profile'],
    'redirect_uri': 'http://localhost:8000/api/auth/oauth/google/callback/',
    'access_type': 'offline',  # For refresh tokens
    'prompt': 'consent',       # Force consent for refresh token
}
```

### Apple OAuth
```python
APPLE_OAUTH = {
    'client_id': env('APPLE_OAUTH_CLIENT_ID'),
    'client_secret': env('APPLE_OAUTH_CLIENT_SECRET'),
    'scope': ['email', 'name'],
    'redirect_uri': 'http://localhost:8000/api/auth/oauth/apple/callback/',
    'response_mode': 'form_post',
}
```

## 📦 Dependencies

```python
# requirements.txt
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.5.0
python-social-auth[django]==1.7.0
django-ratelimit==4.1.0
python-decouple==3.8
psycopg2-binary==2.9.9
requests==2.31.0
```

## 🌍 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/studio_db

# OAuth credentials
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
APPLE_OAUTH_CLIENT_ID=your-apple-client-id  
APPLE_OAUTH_CLIENT_SECRET=your-apple-client-secret

# JWT signing
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173

# Security
DEBUG=False  # Production only
SECRET_KEY=your-django-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,studio.yourdomain.com
```

## 🧪 Implementation Checklist

### Phase 1: Core Authentication (IMMEDIATE)
- [ ] Set up Django project with JWT authentication
- [ ] Implement email/password login/register endpoints
- [ ] Add JWT token blacklisting for logout
- [ ] Create UserProfile model with camelCase serialization
- [ ] Add input validation and error handling
- [ ] Implement rate limiting on auth endpoints

### Phase 2: OAuth Integration (HIGH PRIORITY)
- [ ] Set up Google OAuth flow with callback handling
- [ ] Set up Apple OAuth flow with callback handling  
- [ ] Handle OAuth account creation and linking
- [ ] Add profile picture fetching from OAuth providers
- [ ] Test OAuth redirect flows thoroughly

### Phase 3: Security Hardening (BEFORE PRODUCTION)
- [ ] Add CSRF protection for state-changing requests
- [ ] Implement comprehensive input sanitization
- [ ] Add security headers and CSP
- [ ] Set up automated security testing
- [ ] Add suspicious activity monitoring
- [ ] Document security incident response plan

## ⚠️ Security Considerations

### Known Vulnerabilities (localStorage JWT)
- **XSS Risk**: JWT tokens in localStorage are vulnerable to XSS attacks
- **Mitigation**: Implement strict CSP headers, input sanitization, and XSS protection
- **Future**: Consider migration to httpOnly cookies with CSRF protection

### Token Security
- **Short-lived access tokens**: 15 minutes to minimize exposure window
- **Token blacklisting**: Immediate invalidation on logout
- **Refresh token rotation**: New refresh token on each use
- **Rate limiting**: Prevent brute force attacks

### Data Protection
- **Password hashing**: Django's PBKDF2 with SHA256
- **Secure transmission**: HTTPS only in production
- **Input validation**: Comprehensive validation on all inputs
- **SQL injection protection**: Django ORM prevents SQL injection

## 📝 Implementation Notes

1. **Frontend Compatibility**: All responses must use camelCase formatting
2. **Name Field Handling**: Registration `name` field gets split into `firstName`/`lastName`
3. **Token Storage**: Backend returns JWT in response body for localStorage storage
4. **Error Handling**: Consistent error response format across all endpoints
5. **OAuth Redirects**: Success/error handling through frontend URL parameters
6. **Rate Limiting**: Protect against abuse while maintaining good UX
7. **Security Headers**: Essential for XSS and other attack prevention

This document serves as the complete specification for the authentication system. All implementation should reference this single source of truth. 