import React from 'react';
import MetricCard from '../MetricCard';
import type { ErrorBreakdownItem } from '../../../types/dashboard';
import ErrorsDonutChart from '../charts/ErrorsDonutChart';

interface Props {
  data: ErrorBreakdownItem[];
}

const ErrorsDonutCard: React.FC<Props> = ({ data }) => {
  return (
    <MetricCard title="Errors" height="100%">
      <ErrorsDonutChart data={data} />
    </MetricCard>
  );
};

export default ErrorsDonutCard; 