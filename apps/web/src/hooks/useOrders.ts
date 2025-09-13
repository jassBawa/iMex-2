import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

async function fetchOpenOrders() {
  console.log('🔍 API Call: Fetching open orders...');
  const { data } = await api.get('/trade/get-open-orders');
  console.log('✅ Open orders fetched:', data.orders?.length || 0, 'orders');
  return data.orders as any[];
}

async function fetchClosedOrders() {
  console.log('🔍 API Call: Fetching closed orders...');
  const { data } = await api.get('/trade/get-close-orders');
  console.log('✅ Closed orders fetched:', data.orders?.length || 0, 'orders');
  return data.orders as any[];
}

export function useOpenOrders(enabled: boolean) {
  console.log('🔄 useOpenOrders enabled:', enabled);

  return useQuery({
    queryKey: ['openOrders'],
    queryFn: fetchOpenOrders,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: 0, // Always consider data stale to allow refetching on tab change
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
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

export function useClosedOrders(enabled: boolean) {
  console.log('🔄 useClosedOrders enabled:', enabled);

  return useQuery({
    queryKey: ['closedOrders'],
    queryFn: fetchClosedOrders,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: 0, // Always consider data stale to allow refetching on tab change
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
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
