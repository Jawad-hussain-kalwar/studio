import { useQuery } from '@tanstack/react-query';
import type { DashboardPayload, TimeRange } from '../types/dashboard';
import { http } from '../api/http';

// Fetch dashboard data from the backend API
export function useDashboardData(range: TimeRange) {
  return useQuery({
    queryKey: ['dashboard', range],
    queryFn: async (): Promise<DashboardPayload> => {
      const response = await http.get('/api/dashboard/', {
        params: { range }
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live data
    staleTime: 15000, // Consider data stale after 15 seconds
  });
} 