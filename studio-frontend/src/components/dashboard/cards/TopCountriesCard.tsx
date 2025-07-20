import React from 'react';
import MetricCard from '../MetricCard';
import HorizontalBarChart from '../charts/HorizontalBarChart';
import type { TopItem } from '../../../types/dashboard';

interface Props {
  data: TopItem[];
}

const TopCountriesCard: React.FC<Props> = ({ data }) => (
  <MetricCard title="Top Countries">
    <HorizontalBarChart data={data} />
  </MetricCard>
);

export default TopCountriesCard; 