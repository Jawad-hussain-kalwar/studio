/*
=============================================================================
🔐 BACKEND EXPECTATIONS FOR SIGN UP PAGE  
=============================================================================

This SignUp component expects the following backend implementation:

1. 📧 EMAIL/PASSWORD REGISTRATION
   Endpoint: POST /api/auth/register/
   Request Body: {
     name: string,        // Will be split into first_name/last_name by backend
     email: string,
     password: string
   }
   Success Response (201): {
     access: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     refresh: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." (optional),
     user: {
       id: number,
       email: string,
       first_name: string,
       last_name: string,
       profile_picture: null,
       oauth_provider: "email"
     }
   }
   Error Response (400): {
     error: "Validation failed",
     details: {
       email?: ["Email already exists", "Invalid email format"],
       password?: ["Password too weak", "Password too short"],
       name?: ["Name is required"]
     }
   }

2. 🔐 GOOGLE OAUTH FLOW (Same as SignIn)
   Step 1: User clicks "Continue with Google" button
   Action: window.location.href = "/api/auth/oauth/google/"
   
   Backend Endpoint: GET /api/auth/oauth/google/
   Action: Redirect to Google OAuth with proper scopes
   Google Scopes: ['openid', 'email', 'profile']
   Redirect URI: http://localhost:8000/api/auth/oauth/google/callback/
   
   Step 2: Google redirects to callback
   Backend Endpoint: GET /api/auth/oauth/google/callback/
   Action: Process OAuth code, create/login user, redirect to frontend
   Success Redirect: http://localhost:5173/app?token=<jwt_token>&user=<encoded_user_data>&new_user=true
   Error Redirect: http://localhost:5173/signup?error=<error_message>

3. 🍎 APPLE OAUTH FLOW (Same as SignIn)
   Step 1: User clicks "Continue with Apple" button  
   Action: window.location.href = "/api/auth/oauth/apple/"
   
   Backend Endpoint: GET /api/auth/oauth/apple/
   Action: Redirect to Apple OAuth with proper scopes
   Apple Scopes: ['email', 'name']
   Redirect URI: http://localhost:8000/api/auth/oauth/apple/callback/
   
   Step 2: Apple redirects to callback
   Backend Endpoint: GET /api/auth/oauth/apple/callback/
   Action: Process OAuth code, create/login user, redirect to frontend
   Success Redirect: http://localhost:5173/app?token=<jwt_token>&user=<encoded_user_data>&new_user=true  
   Error Redirect: http://localhost:5173/signup?error=<error_message>

4. 🔄 TOKEN STORAGE & USAGE (Same as SignIn)
   - Frontend stores JWT in localStorage as 'auth_token'
   - Frontend sends token in Authorization header: "Bearer <token>"
   - 401 responses automatically redirect to /signin (already implemented in http.ts)
   - No HTTP-only cookies - frontend manages tokens directly

5. 📝 REGISTRATION VALIDATION REQUIREMENTS
   Email:
   - Must be valid email format
   - Must be unique (not already registered)
   - Case insensitive comparison
   
   Password:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter  
   - At least one number
   - At least one special character (!@#$%^&*)
   
   Name:
   - Required field
   - Minimum 2 characters
   - Backend should split into first_name/last_name intelligently

6. 🔄 OAUTH USER CREATION/LOGIN LOGIC
   - If OAuth email exists: Log in existing user
   - If OAuth email new: Create new user account
   - Store oauth_provider and oauth_id for future logins
   - Set profile_picture from OAuth provider if available

7. 🚫 ERROR HANDLING REQUIREMENTS
   - All auth endpoints should return consistent error format
   - Rate limiting: 5 registration attempts per minute per IP
   - Email collision: Clear message "Email already registered, try logging in"
   - OAuth errors: Redirect to signup with error parameter
   - Validation errors: Field-specific error messages

8. 🌐 CORS CONFIGURATION NEEDED (Same as SignIn)
   - Allow origin: http://localhost:5173 (frontend dev server)
   - Allow credentials: true
   - Allow headers: Authorization, Content-Type

9. 📊 USER CREATION LOGIC FOR NAME FIELD
   Frontend sends single "name" field, backend should:
   - Split on first space: "John Doe" → first_name="John", last_name="Doe"
   - Single name: "John" → first_name="John", last_name=""
   - Empty name: Return validation error

10. 🎯 OAUTH VS EMAIL PROVIDER HANDLING
    - oauth_provider="email" for email/password registration
    - oauth_provider="google" for Google OAuth users  
    - oauth_provider="apple" for Apple OAuth users
    - Store oauth_id for OAuth users (Google/Apple user ID)

=============================================================================
*/

import { Box, Button, Stack, TextField, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import GoogleOutlined from "@mui/icons-material/Google";
import AppleOutlined from "@mui/icons-material/Apple";
import { API_BASE_URL } from "../../api/http";
import { useThemeBackground, useGlassStyles } from "../../components/themeHelpers.tsx";
import { ThemeToggle } from "../../components/ThemeToggle";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string[]}>({});
  
  const backgroundImage = useThemeBackground(
    "/assets/img/ui/blob1-ul.jpg",
    "/assets/img/ui/blob1-ud.jpg"
  );
  const glassStyles = useGlassStyles();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formError) setFormError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    setFieldErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('auth_token', data.access);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Redirect to app
        navigate('/app/studio/chat');
      } else {
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          setFormError(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setFormError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/api/auth/oauth/google/`;
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
      }}
    >
      {/* Auth Panel with Glassmorphism - Full Height, Extreme Right */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          height: "100vh",
          width: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...glassStyles,
          borderLeft: glassStyles.border,
          borderTop: "none",
          borderRight: "none",
          borderBottom: "none",
        }}
      >
        {/* Theme Toggle - Top Right */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <ThemeToggle
            size="small"
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          />
        </Box>

        {/* Inner Container for Centered Content */}
        <Box sx={{ width: "320px", textAlign: "center" }}>
          {/* AI STUDIO with gradient */}
          <Box
            sx={{
              textAlign: "right",
              mb: 2,
            }}
          >
            <Typography
              component="div"
              sx={{
                fontSize: "1rem",
                fontWeight: "600",
                background:
                  "linear-gradient(90deg, #014d4e 0%, #009688 25%, #8bc34a 75%, #e9d842 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
              }}
            >
              AI STUDIO
            </Typography>
          </Box>

          {/* Error Alert */}
          {(error || formError) && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                bgcolor: "rgba(211, 47, 47, 0.1)",
                color: "white",
                "& .MuiAlert-icon": {
                  color: "#ff6b6b"
                }
              }}
            >
              {formError || decodeURIComponent(error || '')}
            </Alert>
          )}

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: "500",
              color: "white",
              fontSize: "1.1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Sign up
          </Typography>

          <Stack spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<GoogleOutlined fontSize="small" />}
              fullWidth
              onClick={handleGoogleOAuth}
              sx={{
                justifyContent: "flex-start",
                height: 56,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "28px",
                paddingRight: "20px",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  borderColor: "rgba(255,255,255,0.5)",
                },
              }}
            >
              Continue with Google
            </Button>
            <Button
              variant="outlined"
              startIcon={<AppleOutlined fontSize="small" />}
              fullWidth
              disabled
              sx={{
                justifyContent: "flex-start",
                height: 56,
                bgcolor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                borderColor: "rgba(255,255,255,0.2)",
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "28px",
                paddingRight: "20px",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  borderColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              Continue with Apple (Coming Soon)
            </Button>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mt: 2.5,
              mb: 1.5,
              color: "white",
              fontWeight: "500",
              textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              fontSize: "0.75rem",
            }}
          >
            Continue with email
          </Typography>

          <Stack spacing={1.5} component="form" onSubmit={handleEmailSignUp}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!(fieldErrors.name && fieldErrors.name.length > 0)}
              helperText={fieldErrors.name && fieldErrors.name[0]}
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                "& .MuiFormHelperText-root": { color: "#ff6b6b" },
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!(fieldErrors.email && fieldErrors.email.length > 0)}
              helperText={fieldErrors.email && fieldErrors.email[0]}
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                "& .MuiFormHelperText-root": { color: "#ff6b6b" },
              }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              disabled={isLoading}
              error={!!(fieldErrors.password && fieldErrors.password.length > 0)}
              helperText={fieldErrors.password && fieldErrors.password[0]}
              sx={{
                "& .MuiInputBase-root": {
                  height: 56,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "0.8rem",
                  paddingLeft: "24px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "16px",
                },
                "& .MuiInputBase-input": {
                  padding: "0 0 0 0",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  boxSizing: "border-box",
                  paddingLeft: "0",
                  paddingRight: "0",
                  paddingTop: "16.5px",
                  paddingBottom: "16.5px",
                },
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" },
                "& .MuiFormHelperText-root": { color: "#ff6b6b" },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{
                height: 56,
                mb: 1.5,
                fontWeight: "500",
                fontSize: "0.8rem",
                paddingLeft: "20px",
                paddingRight: "20px",
              }}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </Stack>

          <Typography variant="body2" align="center" sx={{ mt: 1.5, fontSize: "0.75rem" }}>
            <Box component="span" sx={{ color: "white", fontWeight: "500" }}>
              Already have an account?{" "}
            </Box>
            <Button
              component={RouterLink}
              to="/signin"
              sx={{
                textTransform: "none",
                p: 0,
                color: "primary.main",
                fontWeight: "600",
                fontSize: "0.75rem",
              }}
            >
              Log in
            </Button>
          </Typography>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            <Button
              sx={{
                textTransform: "none",
                p: 0,
                color: "primary.main",
                fontWeight: "500",
                fontSize: "0.75rem",
              }}
            >
              Cookies Settings
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignUp;
