import React from 'react';
import MetricCard from '../MetricCard';
import type { RequestsSeries } from '../../../types/dashboard';
import RequestsLineChart from '../charts/RequestsLineChart';

interface Props {
  data: RequestsSeries[];
}

const RequestsChartCard: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.success + d.error, 0).toLocaleString();
  return (
    <MetricCard title="Requests" headline={total} height="100%">
      <RequestsLineChart data={data} />
    </MetricCard>
  );
};

export default RequestsChartCard; 