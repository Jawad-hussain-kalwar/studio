/*
=============================================================================
🌐 BACKEND API EXPECTATIONS FOR HTTP CLIENT
=============================================================================

This HTTP client expects the following backend API structure and behavior:

1. 🏠 BASE CONFIGURATION
   Backend URL: http://localhost:8000 (development)
   API Prefix: /api/
   
   Required Environment Variables:
   - VITE_API_BASE_URL=http://localhost:8000 (optional, defaults to localhost:8000)

2. 🔐 AUTHENTICATION FLOW
   Token Storage: localStorage.getItem('auth_token')
   Authorization Header: "Bearer <jwt_token>"
   
   Backend JWT Requirements:
   - Standard JWT format
   - Include user ID and email in payload
   - 1 hour expiration recommended
   - HS256 algorithm

3. 📡 API RESPONSE STANDARDS
   All API responses should follow consistent format:
   
   Success Responses:
   - Status: 200/201/204
   - Content-Type: application/json
   - Body: { data: {}, message?: string }
   
   Error Responses:
   - Status: 400/401/403/404/500
   - Content-Type: application/json
   - Body: { error: string, message?: string, details?: object }

4. 🚫 401 HANDLING BEHAVIOR
   When backend returns 401:
   - Frontend automatically removes 'auth_token' from localStorage
   - Frontend redirects to '/signin'
   - Backend should include clear error message
   
   401 Scenarios:
   - Token expired
   - Token invalid/malformed
   - Token blacklisted (after logout)
   - No token provided for protected route

5. 🌐 CORS REQUIREMENTS
   Backend must configure CORS to allow:
   - Origin: http://localhost:5173
   - Methods: GET, POST, PUT, DELETE, OPTIONS
   - Headers: Authorization, Content-Type, X-Requested-With
   - Credentials: true

6. ⏱️ TIMEOUT HANDLING
   Current timeout: 30 seconds
   Backend should:
   - Process auth requests quickly (< 5 seconds)
   - Use proper HTTP status codes for timeouts
   - Implement request timeout on server side

7. 📊 EXPECTED API ENDPOINTS
   Auth Endpoints:
   - POST /api/auth/login/
   - POST /api/auth/register/
   - GET /api/auth/oauth/google/
   - GET /api/auth/oauth/google/callback/
   - GET /api/auth/oauth/apple/
   - GET /api/auth/oauth/apple/callback/
   - GET /api/auth/me/
   - POST /api/auth/logout/
   
   Future Endpoints (when backend is implemented):
   - Chat/AI endpoints
   - Image generation endpoints
   - User profile management
   - Settings and preferences

8. 🔒 SECURITY HEADERS EXPECTED
   Backend should include security headers:
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Strict-Transport-Security (in production)

=============================================================================
*/

import axios from 'axios';

/**
 * Resolve backend base URL
 * 1. Use VITE_API_BASE_URL if provided at build-time.
 * 2. Fallback to current page hostname with :8000 (works for LAN testing).
 */
const getDefaultBackend = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultBackend();

// Create axios instance
export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
http.interceptors.request.use(
  (config) => {
    // TODO: Get JWT token from auth store when implemented
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Redirect to login or refresh token
      localStorage.removeItem('auth_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
); 