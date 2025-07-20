# Authentication Implementation

## Current Status

Django authentication app is implemented with Google OAuth 2.0 flow and JWT token management. Email/password endpoints exist but return 501 Not Implemented.

## Implemented Features

### 1. Google OAuth 2.0
- Complete OAuth flow with state verification
- User creation/login on successful OAuth
- JWT token generation in response body
- Frontend redirect with token and user data

### 2. JWT Token Management
- Uses djangorestframework-simplejwt
- Tokens stored in localStorage (not cookies)
- Bearer token authentication format
- camelCase user data serialization

### 3. User Model
- Django User model with UserProfile extension
- Stores OAuth provider and profile picture
- camelCase serialization for frontend

## API Endpoints

### Implemented and Working

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| `GET` | `/api/auth/oauth/google/` | Initiate Google OAuth | Redirects to Google |
| `GET` | `/api/auth/oauth/google/callback/` | Handle OAuth callback | Redirects to frontend with token |
| `GET` | `/api/auth/health/` | Health check | `{status: "ok"}` |

### Implemented but Non-functional (501 responses)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| `POST` | `/api/auth/login/` | Email/password login | Returns 501 |
| `POST` | `/api/auth/register/` | Email/password registration | Returns 501 |

## Google OAuth Flow

### 1. Initiation
User clicks "Continue with Google" button:
```
GET /api/auth/oauth/google/
```

Backend redirects to Google with:
- Client ID from settings
- Scopes: openid, email, profile
- State for CSRF protection

### 2. Callback Processing
Google redirects to:
```
GET /api/auth/oauth/google/callback/?code=xxx&state=yyy
```

Backend:
1. Verifies state (CSRF protection)
2. Exchanges code for tokens
3. Fetches user info from Google
4. Creates/updates Django User and UserProfile
5. Generates JWT token
6. Redirects to frontend

### 3. Frontend Redirect
Success redirect:
```
http://localhost:5173/app?token=<jwt>&user=<base64_encoded_user>
```

Error redirect:
```
http://localhost:5173/signin?error=<error_message>
```

## Data Models

### UserProfile
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    oauth_provider = models.CharField(max_length=50, default='email')
    oauth_id = models.CharField(max_length=255, blank=True)
    profile_picture = models.URLField(blank=True)
```

## User Data Format

JWT payload includes user data in camelCase:
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "https://...",
  "oauthProvider": "google",
  "createdAt": "2025-01-27T10:00:00Z"
}
```

## Environment Variables

Required in `.env`:
```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8000/api/auth/oauth/google/callback/
FRONTEND_URL=http://localhost:5173
```

## Security Features

1. **State Parameter**: CSRF protection in OAuth flow
2. **HTTPS Required**: For production OAuth
3. **Token in Body**: For localStorage (not cookies)
4. **User Creation**: Automatic on first OAuth login

## Not Implemented

1. **Apple OAuth**: No implementation
2. **Email/Password**: Endpoints exist but return 501
3. **Token Refresh**: Refresh tokens not used
4. **Token Blacklisting**: No logout functionality
5. **Rate Limiting**: No implementation
6. **Password Reset**: No implementation

## Frontend Integration

Frontend `OAuthCallback` component:
1. Receives token and user from URL params
2. Stores in localStorage
3. Redirects to authenticated app

Frontend `http.ts`:
1. Adds Bearer token to all requests
2. Redirects to /signin on 401 responses 