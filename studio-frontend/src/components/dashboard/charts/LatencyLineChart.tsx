import React from 'react';
import { LineChart } from '@mui/x-charts';
import type { LatencyPoint } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: LatencyPoint[];
}

const LatencyLineChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  
  // Format timestamps to readable dates like "22 Feb"
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };
  
  const x = data.map((d) => formatDate(d.timestamp));
  const y = data.map((d) => d.latency);

  return (
    <LineChart
      xAxis={[{ scaleType: 'point', data: x }]}
      series={[{ 
        data: y, 
        label: 'latency', 
        color: theme.palette.info.main,
        area: true
      }]}
      height={200}
      margin={{ left: 30, right: 30, top: 20, bottom: 40 }}
    />
  );
};

export default LatencyLineChart; 