import React from 'react';
import { Box, Paper, Typography, Button, Chip, Tabs, Tab } from '@mui/material';
import { CalendarToday, Filter } from '@mui/icons-material';
import type { TimeRange } from '../../types/dashboard';

interface Props {
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
}

const timeRangeLabels: Record<TimeRange, string> = {
  'custom': 'Custom',
  '24h': '24H',
  '7d': '7D',
  '1m': '1M',
  '3m': '3M'
};

const DashboardHeader: React.FC<Props> = ({ range, onRangeChange }) => {
  const handleTabChange = (_: React.SyntheticEvent, newValue: TimeRange) => {
    onRangeChange(newValue);
  };

  return (
    <Box>
      {/* Top Row: Title and Live Status */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h4" fontWeight={600} color="text.primary">
          Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Filter />}
            sx={{ textTransform: 'none' }}
          >
            Show Filters
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Saved Filters
          </Button>
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main' 
                  }} 
                />
                <Typography variant="body2" fontWeight={600}>
                  Live
                </Typography>
              </Box>
            }
            sx={{ 
              bgcolor: 'success.light', 
              color: 'success.dark', 
              fontWeight: 600 
            }}
          />
        </Box>
      </Box>

      {/* Second Row: Date Range and Time Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2,
        }}
      >
        {/* Date Range Picker */}
        <Paper 
          variant="outlined" 
          sx={{ 
            px: 2, 
            py: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            minWidth: 'fit-content'
          }}
        >
          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Jul 15, 2025 09:15 - 10:15
          </Typography>
          <Button 
            size="small" 
            variant="text" 
            sx={{ textTransform: 'none', ml: 1 }}
          >
            Filter
          </Button>
        </Paper>

        {/* Time Range Tabs */}
        <Tabs
          value={range}
          onChange={handleTabChange}
          variant="standard"
          sx={{
            minHeight: 'auto',
            '& .MuiTab-root': {
              minHeight: 'auto',
              minWidth: 'auto',
              px: 2,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 2,
            },
          }}
        >
          {(Object.keys(timeRangeLabels) as TimeRange[]).map((timeRange) => (
            <Tab
              key={timeRange}
              label={timeRangeLabels[timeRange]}
              value={timeRange}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
};

export default DashboardHeader; 