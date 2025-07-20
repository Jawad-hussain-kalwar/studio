import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { PieChart } from '@mui/x-charts';
import type { ErrorBreakdownItem } from '../../../types/dashboard';

interface Props {
  data: ErrorBreakdownItem[];
}

const ErrorsDonutChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Dynamic color assignment based on error types
  const getColorForErrorType = (label: string, index: number) => {
    const colors = [
      '#2196F3', // Blue 
      '#00BCD4', // Teal  
      '#009688', // Darker teal
      '#4CAF50', // Green for additional types
      '#FF9800', // Orange for additional types
    ];
    return colors[index % colors.length];
  };

  const chartData = data.map((item, idx) => ({
    id: item.label,
    value: item.value,
    label: item.label,
    color: getColorForErrorType(item.label, idx),
  }));

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      px: 1,
      py: 0.5
    }}>
      {/* Legend */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
        width: '100%'
      }}>
        {data.map((item, idx) => (
          <Box key={item.label} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5 
          }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: getColorForErrorType(item.label, idx),
              flexShrink: 0
            }} />
            <Typography variant="body2" color="text.secondary" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chart container with center text */}
      <Box sx={{ 
        position: 'relative', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 180,
        mx: 'auto'
      }}>
        <PieChart
          series={[
            {
              innerRadius: 55,
              outerRadius: 85,
              data: chartData,
              paddingAngle: 1,
            },
          ]}
          width={200}
          height={180}
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
          slotProps={{ 
            legend: { hidden: true },
          }}
        />
        
        {/* Center text overlay */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <Typography 
            variant="h3" 
            fontWeight={700} 
            sx={{ 
              fontSize: '2rem',
              lineHeight: 1,
              color: 'text.primary'
            }}
          >
            {total.toLocaleString()}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              lineHeight: 1,
              mt: 0.5
            }}
          >
            Total Errors
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ErrorsDonutChart; 