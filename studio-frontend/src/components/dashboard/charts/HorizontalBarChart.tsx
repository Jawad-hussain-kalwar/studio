import React from 'react';
import { BarChart } from '@mui/x-charts';
import type { TopItem } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: TopItem[];
}

const HorizontalBarChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const labels = data.map((d) => d.name);
  const values = data.map((d) => d.requests);

  return (
    <BarChart
      layout="horizontal"
      xAxis={[{ scaleType: 'linear' }]}
      yAxis={[{ scaleType: 'band', data: labels }]}
      series={[{
        data: values,
        color: theme.palette.primary.main,
      }]}
      height={260}
      margin={{ left: 120 }}
    />
  );
};

export default HorizontalBarChart; 