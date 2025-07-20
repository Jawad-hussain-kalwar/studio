import React from 'react';
import { LineChart } from '@mui/x-charts';
import type { LatencyPoint } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: LatencyPoint[];
}

const LatencyLineChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const x = data.map((d) => d.timestamp);
  const y = data.map((d) => d.latency);

  return (
    <LineChart
      xAxis={[{ scaleType: 'point', data: x }]}
      series={[{ data: y, label: 'latency', color: theme.palette.info.main }]}
      height="100%"
    />
  );
};

export default LatencyLineChart; 