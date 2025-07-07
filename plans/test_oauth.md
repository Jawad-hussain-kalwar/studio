# Testing Google OAuth Integration

## Prerequisites

1. **Backend running**: `python manage.py runserver localhost:8000`
2. **Frontend running**: `npm run dev` (should be on localhost:5173)
3. **Google OAuth configured**: `.env` file with valid credentials

## Testing Steps

### 1. Test Backend Health
```bash
curl http://localhost:8000/api/auth/health/
# Expected: {"status": "ok", "message": "Auth service is running"}
```

### 2. Test Google OAuth Redirect
```bash
curl -L http://localhost:8000/api/auth/oauth/google/
# Expected: Should redirect to Google OAuth or show error if credentials not configured
```

### 3. Test Frontend Integration

1. **Open browser**: Go to `http://localhost:5173/signin`
2. **Click "Continue with Google"**: Should redirect to backend OAuth endpoint
3. **Complete Google OAuth**: Login with Google account
4. **Verify redirect**: Should come back to `http://localhost:5173/app` with token parameters
5. **Check localStorage**: Should contain `auth_token` and `user_data`

### 4. Verify Token Storage

After successful OAuth, check browser localStorage:
```javascript
localStorage.getItem('auth_token')  // Should have JWT token
localStorage.getItem('user_data')   // Should have user profile JSON
```

### 5. Test App Access

After successful OAuth, user should be automatically redirected to `/app/studio/chat` and have access to the authenticated app.

## Expected Flow

```
[SignIn Page] 
    ↓ Click "Continue with Google"
[Backend OAuth] → [Google OAuth] → [Google Callback]
    ↓ Success
[Backend Callback] → [Frontend /app?token=xxx&user=xxx]
    ↓ Process params
[OAuthCallback Component] → Store token → Redirect to /app/studio/chat
    ↓ 
[Authenticated App Access]
```

## Troubleshooting

- **No redirect**: Check Google OAuth credentials in `.env`
- **Error alert**: Check browser console and error message
- **401 errors**: Verify JWT token is properly stored and sent
- **CORS errors**: Ensure backend CORS is configured for localhost:5173 