# Backend Setup for Google OAuth

## 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add these URLs:

**Authorized redirect URIs:**
```
http://localhost:8000/api/auth/oauth/google/callback/
```

**Authorized JavaScript origins:**
```
http://localhost:8000
http://localhost:5173
```

## 2. Environment Variables

Create a `.env` file in the `studio-backend` directory with:

```env
# Google OAuth (Required)
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id-here
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret-here

# Optional
SECRET_KEY=your-custom-secret-key
DEBUG=True
FRONTEND_URL=http://localhost:5173
```

## 3. Run the Server

```bash
python manage.py runserver localhost:8000
```

## 4. Test the Flow

1. Start frontend: `npm run dev` (port 5173)
2. Start backend: `python manage.py runserver localhost:8000`
3. Go to `http://localhost:5173/signin`
4. Click "Continue with Google"
5. Complete OAuth flow 