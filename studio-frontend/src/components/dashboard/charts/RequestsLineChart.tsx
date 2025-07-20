import React from 'react';
import { LineChart } from '@mui/x-charts';
import { Box, Typography } from '@mui/material';
import type { RequestsSeries } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: RequestsSeries[];
}

const RequestsLineChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  
  // Format timestamps for x-axis labels
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const x = data.map((d) => formatTimestamp(d.timestamp));
  const success = data.map((d) => d.success);
  const error = data.map((d) => d.error);

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: 200 }}>
      {/* Custom Legend */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
          display: 'flex',
          gap: 2,
          mb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.success.main 
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            success
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: theme.palette.error.main 
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            error
          </Typography>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ height: '100%', pt: 2 }}>
        <LineChart
          xAxis={[{ 
            scaleType: 'point', 
            data: x,
            tickLabelStyle: {
              fontSize: 12,
              fill: theme.palette.text.secondary,
            }
          }]}
          series={[
            {
              data: success,
              label: 'success',
              color: theme.palette.success.main,
              curve: 'monotoneX',
              area: false,
              showMark: false,
              strokeWidth: 2,
            },
            {
              data: error,
              label: 'error',
              color: theme.palette.error.main,
              curve: 'monotoneX',
              area: false,
              showMark: false,
              strokeWidth: 2,
            },
          ]}
          height={200}
          margin={{ left: 0, right: 0, top: 20, bottom: 30 }}
          slotProps={{
            legend: { hidden: true },
            tooltip: { 
              trigger: 'axis',
              axisContent: ({ axisValue, series }) => (
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    {axisValue}
                  </Typography>
                  {series.map((s) => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: s.color 
                        }} 
                      />
                      <Typography variant="caption">
                        {s.label}: {s.value?.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )
            },
            axisContent: {
              sx: {
                '& .MuiChartsAxis-tickLabel': {
                  fontSize: '0.75rem',
                  fill: theme.palette.text.secondary,
                }
              }
            }
          }}
          sx={{
            '& .MuiChartsAxis-line': {
              stroke: theme.palette.divider,
            },
            '& .MuiChartsAxis-tick': {
              stroke: theme.palette.divider,
            },
            '& .MuiChartsGrid-line': {
              stroke: theme.palette.divider,
              strokeOpacity: 0.3,
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default RequestsLineChart; 