import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface BalanceResponse {
  balance: {
    amount: number;
    currency: string;
  };
}

async function fetchUserBalance(): Promise<BalanceResponse> {
  const { data } = await api.get('/balance/me');
  return data;
}

export function useBalance(enabled: boolean = true) {
  return useQuery({
    queryKey: ['balance'],
    queryFn: fetchUserBalance,
    enabled,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors (401, 403, 404 for missing auth)
      if (
        error?.response?.status === 401 ||
        error?.response?.status === 403 ||
        error?.response?.status === 404
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
}
