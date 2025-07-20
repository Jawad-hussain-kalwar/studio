// Mock dashboard data for different time ranges.
// Easily replaceable when backend is available.

import type { DashboardPayload, TimeRange } from '../types/dashboard';

// Utility: generate sequential timestamps for the past n days
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const generateArray = (length: number, fn: (idx: number) => any) =>
  Array.from({ length }, (_, idx) => fn(idx));

// 7-day sample
const sample7d: DashboardPayload = {
  range: '7d',
  generatedAt: new Date().toISOString(),
  requests: generateArray(7, (i) => ({
    timestamp: daysAgo(6 - i),
    success: Math.floor(1500 + Math.random() * 500),
    error: Math.floor(5 + Math.random() * 20),
  })),
  errorsBreakdown: [
    { label: '400', value: 120 },
    { label: '401', value: 45 },
    { label: '500', value: 32 },
  ],
  topModels: [
    { name: 'gpt-4-vision-preview', requests: 240000 },
    { name: 'gpt-4', requests: 180000 },
    { name: 'gpt-4o', requests: 125000 },
  ],
  costs: generateArray(7, (i) => ({
    timestamp: daysAgo(6 - i),
    cost: parseFloat((250 + Math.random() * 50).toFixed(2)),
  })),
  topCountries: [
    { name: 'United States (US)', requests: 4389 },
    { name: 'Indonesia (ID)', requests: 2948 },
    { name: 'India (IN)', requests: 2317 },
  ],
  latency: generateArray(7, (i) => ({
    timestamp: daysAgo(6 - i),
    latency: parseFloat((4 + Math.random() * 2).toFixed(2)),
  })),
};

// Create quick clones for other ranges by tweaking length
const cloneWithRange = (range: TimeRange, days: number): DashboardPayload => ({
  ...sample7d,
  range,
  requests: generateArray(days, (i) => ({
    timestamp: daysAgo(days - 1 - i),
    success: Math.floor(1500 + Math.random() * 500),
    error: Math.floor(5 + Math.random() * 20),
  })),
  costs: generateArray(days, (i) => ({
    timestamp: daysAgo(days - 1 - i),
    cost: parseFloat((250 + Math.random() * 50).toFixed(2)),
  })),
  latency: generateArray(days, (i) => ({
    timestamp: daysAgo(days - 1 - i),
    latency: parseFloat((4 + Math.random() * 2).toFixed(2)),
  })),
});

export const MOCK_DASHBOARD_BY_RANGE: Record<TimeRange, DashboardPayload> = {
  '24h': cloneWithRange('24h', 24),
  '7d': sample7d,
  '1m': cloneWithRange('1m', 30),
  '3m': cloneWithRange('3m', 90),
  custom: sample7d, // fallback
}; 