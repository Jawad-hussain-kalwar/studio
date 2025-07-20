/*
 Dashboard data TypeScript interfaces
 These structures mirror both the mock data and the backend response contract (see dashboard-b-i.md).
*/

export type TimeRange = '24h' | '7d' | '1m' | '3m' | 'custom';

export interface RequestsSeries {
  timestamp: string; // ISO date string or datetime depending on grain
  success: number;
  error: number;
}

export interface ErrorBreakdownItem {
  label: string; // status code e.g. '400'
  value: number;
}

export interface TopItem {
  name: string; // model name or country code
  requests: number;
}

export interface CostPoint {
  timestamp: string; // day
  cost: number; // USD
}

export interface LatencyPoint {
  timestamp: string; // datetime
  latency: number; // seconds or ms
}

export interface DashboardPayload {
  range: TimeRange;
  generatedAt: string;
  requests: RequestsSeries[];
  errorsBreakdown: ErrorBreakdownItem[];
  topModels: TopItem[];
  costs: CostPoint[];
  topCountries: TopItem[];
  latency: LatencyPoint[];
} 