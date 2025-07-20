import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import type { PaperProps } from '@mui/material';

export interface MetricCardProps extends PaperProps {
  title: string;
  headline?: React.ReactNode;
  height?: number | string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, headline, height = 300, icon, children, ...paperProps }) => {
  return (
    <Paper
      variant="outlined"
      elevation={0}
      sx={{
        p: 2,
        height: height === '100%' ? '100%' : height,
        minHeight: height === '100%' ? '80px' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (theme) => theme.palette.background.paper,
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      {...paperProps}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 1
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {title}
        </Typography>
        {icon && (
          <Box sx={{ 
            color: 'text.secondary',
            '& > svg': {
              fontSize: '1.4rem'
            }
          }}>
            {icon}
          </Box>
        )}
      </Box>
      {headline && (
        <Typography variant="h5" fontWeight={700} mb={1} sx={{ fontSize: '1.5rem' }}>
          {headline}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Paper>
  );
};

export default MetricCard; 