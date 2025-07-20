import React from 'react';
import { BarChart } from '@mui/x-charts';
import type { CostPoint } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: CostPoint[];
}

const CostsBarChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  const x = data.map((d) => d.timestamp);
  const y = data.map((d) => d.cost);

  return (
    <BarChart
      xAxis={[{ scaleType: 'band', data: x }]}
      series={[{ data: y, color: theme.palette.info.main }]}
      height="100%"
      margin={{ left: 40 }}
    />
  );
};

export default CostsBarChart; 