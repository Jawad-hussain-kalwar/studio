import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

interface OAuthCallbackProps {
  onAuthSuccess?: (token: string, user: import('../types').User) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userEncoded = searchParams.get('user');
    const error = searchParams.get('error');

    // console.log('OAuthCallback - Processing parameters:');
    // console.log('- Token present:', !!token);
    // console.log('- User data present:', !!userEncoded);
    // console.log('- Error:', error);

    if (error) {
      // Handle OAuth error
      console.error('OAuth Error:', error);
      navigate('/signin?error=' + encodeURIComponent(error));
      return;
    }

    if (token && userEncoded) {
      try {
        // console.log('Processing successful OAuth...');
        
        // Store JWT token in localStorage
        localStorage.setItem('auth_token', token);
        // console.log('Token stored in localStorage');

        // Decode user data from base64
        const userJson = atob(userEncoded);
        // console.log('Decoded user JSON:', userJson);
        
        const user = JSON.parse(userJson);
        // console.log('Parsed user object:', user);

        // Store user data in localStorage
        localStorage.setItem('user_data', JSON.stringify(user));
        // console.log('User data stored in localStorage');

        // Call success callback if provided
        if (onAuthSuccess) {
          onAuthSuccess(token, user);
        }

        // console.log('Redirecting to /app/studio/chat...');
        // Redirect to dashboard/app
        navigate('/app/studio/chat', { replace: true });
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        navigate('/signin?error=Authentication failed');
      }
    } else {
      // console.log('No token or user data found, redirecting to signin');
      // No token or user data, redirect to signin
      navigate('/signin', { replace: true });
    }
  }, [searchParams, navigate, onAuthSuccess]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body1" color="text.secondary">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default OAuthCallback; 