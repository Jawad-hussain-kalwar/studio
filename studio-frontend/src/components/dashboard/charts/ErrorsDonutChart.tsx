import React from 'react';
import { PieChart } from '@mui/x-charts';
import type { ErrorBreakdownItem } from '../../../types/dashboard';
import { useTheme } from '@mui/material';

interface Props {
  data: ErrorBreakdownItem[];
}

const ErrorsDonutChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  // Map to sectors
  return (
    <PieChart
      slotProps={{ legend: { hidden: true } }}
      series={[
        {
          innerRadius: 60,
          outerRadius: 100,
          data: data.map((item, idx) => ({
            id: item.label,
            value: item.value,
            label: item.label,
            color: [
              theme.palette.info.light,
              theme.palette.warning.main,
              theme.palette.error.main,
            ][idx % 3],
          })),
        },
      ]}
              height="100%"
    />
  );
};

export default ErrorsDonutChart; 