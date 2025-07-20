import React from 'react';
import MetricCard from '../MetricCard';
import type { ErrorBreakdownItem } from '../../../types/dashboard';
import ErrorsDonutChart from '../charts/ErrorsDonutChart';

interface Props {
  data: ErrorBreakdownItem[];
}

const ErrorsDonutCard: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0).toLocaleString();
  return (
    <MetricCard title="Errors" headline={total} height="100%">
      <ErrorsDonutChart data={data} />
    </MetricCard>
  );
};

export default ErrorsDonutCard; 