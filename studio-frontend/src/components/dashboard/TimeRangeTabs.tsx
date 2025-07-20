import React from 'react';
import { Tabs, Tab } from '@mui/material';
import type { TimeRange } from '../../types/dashboard';

const RANGES: { value: TimeRange; label: string }[] = [
  { value: 'custom', label: 'Custom' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
];

interface TimeRangeTabsProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const TimeRangeTabs: React.FC<TimeRangeTabsProps> = ({ value, onChange }) => {
  const handleChange = (_: React.SyntheticEvent, newValue: TimeRange) => {
    onChange(newValue);
  };

  return (
    <Tabs
      value={value}
      onChange={handleChange}
      sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, px: 1.5 } }}
    >
      {RANGES.map((range) => (
        <Tab key={range.value} value={range.value} label={range.label} />
      ))}
    </Tabs>
  );
};

export default TimeRangeTabs; 