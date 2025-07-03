/*
=============================================================================
🔐 AUTHENTICATION TYPE DEFINITIONS
=============================================================================

These types define the expected data structures for auth responses from backend.
Backend implementation must match these interfaces exactly.

=============================================================================
*/

// Auth response types expected from backend
export interface AuthResponse {
  access: string;
  refresh?: string; // Optional - frontend doesn't currently use refresh tokens
  user: User;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  oauth_provider: 'email' | 'google' | 'apple';
  created_at: string; // ISO format: "2025-01-27T10:00:00Z"
}

// Login request types
export interface LoginRequest {
  email: string;
  password: string;
}

// Registration request types  
export interface RegisterRequest {
  name: string;    // Backend should split into first_name/last_name
  email: string;
  password: string;
}

// Error response types from backend
export interface AuthError {
  error: string;
  message?: string;
  details?: Record<string, string[]>; // For validation errors
}

// OAuth callback query parameters expected from backend redirects
export interface OAuthCallbackParams {
  token?: string;           // JWT token on success
  user?: string;           // Base64 encoded user object
  new_user?: string;       // "true" if user was just created
  error?: string;          // Error message on failure
}

/*
=============================================================================
📝 BACKEND VALIDATION REQUIREMENTS SUMMARY
=============================================================================

Email Validation:
- Valid email format
- Unique (case insensitive)
- Max length: 254 characters

Password Validation:
- Minimum 8 characters
- At least one uppercase letter [A-Z]
- At least one lowercase letter [a-z]  
- At least one number [0-9]
- At least one special character [!@#$%^&*()_+-=[]{}|;:,.<>?]

Name Validation:
- Required field
- Minimum 2 characters
- Max length: 100 characters
- Split logic: "John Doe" → first_name="John", last_name="Doe"

OAuth Provider Values:
- "email" for email/password registration
- "google" for Google OAuth users
- "apple" for Apple OAuth users

=============================================================================
*/

// Re-export all types from chat.ts
export * from './chat.ts';