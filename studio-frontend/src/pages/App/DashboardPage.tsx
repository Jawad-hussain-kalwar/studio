import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardGrid from '../../components/dashboard/DashboardGrid';
import type { TimeRange } from '../../types/dashboard';
import { useDashboardData } from '../../hooks/useDashboardData';

const DashboardPage: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('7d');
  const { data, isLoading, error } = useDashboardData(range);

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Failed to load dashboard data. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      pt: { xs: '56px', sm: '64px' }, // Offset for fixed TopBar (mobile & desktop)
    }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <DashboardHeader range={range} onRangeChange={handleRangeChange} />
      </Box>
      {isLoading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <Box sx={{ px: 3, pb: 3 }}>
          <DashboardGrid data={data} />
        </Box>
      ) : null}
    </Box>
  );
};

export default DashboardPage; 