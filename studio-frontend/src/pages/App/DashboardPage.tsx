import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardPage: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        p: 4,
      }}
    >
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        Welcome to your dashboard! This area will soon show metrics and quick links.
        Stay tuned.
      </Typography>
    </Box>
  );
};

export default DashboardPage; 