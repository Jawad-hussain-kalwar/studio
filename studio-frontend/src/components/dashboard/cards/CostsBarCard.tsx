import React from 'react';
import MetricCard from '../MetricCard';
import CostsBarChart from '../charts/CostsBarChart';
import type { CostPoint } from '../../../types/dashboard';

interface Props {
  data: CostPoint[];
}

const CostsBarCard: React.FC<Props> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.cost, 0);
  const formatted = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return (
    <MetricCard title="Costs" headline={formatted} height="100%">
      <CostsBarChart data={data} />
    </MetricCard>
  );
};

export default CostsBarCard; 