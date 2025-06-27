import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Reusable placeholder component for under-construction pages.
 *
 * It fills the available parent space and vertically + horizontally centers
 * the provided message (defaults to "Coming Soon").
 */
const ComingSoon: React.FC<{ message?: string }> = ({ message = 'Coming Soon' }) => (
  <Box
    sx={{
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      px: 2,
      pt: { xs: '56px', sm: '64px' },
      boxSizing: 'border-box',
    }}
  >
    <Typography
      variant="h4"
      component="h1"
      sx={{
        fontWeight: 600,
        textAlign: 'center',
        opacity: 0.8,
      }}
    >
      {message}
    </Typography>
  </Box>
);

export default ComingSoon; 