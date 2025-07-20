import React from 'react';
import MetricCard from '../MetricCard';
import LatencyLineChart from '../charts/LatencyLineChart';
import type { LatencyPoint } from '../../../types/dashboard';

interface Props {
  data: LatencyPoint[];
}

const LatencyChartCard: React.FC<Props> = ({ data }) => {
  const avg = data.length ? data.reduce((sum, d) => sum + d.latency, 0) / data.length : 0;
  const headline = `${avg.toFixed(3)} s / req`;
  return (
    <MetricCard title="Latency" headline={headline} height="100%">
      <LatencyLineChart data={data} />
    </MetricCard>
  );
};

export default LatencyChartCard; 