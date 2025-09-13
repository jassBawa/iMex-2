import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface CloseOrderPayload {
  orderId: string;
}

export async function closeOrder(payload: CloseOrderPayload) {
  const { data } = await api.post('/trade/close-order', payload);
  return data;
}

export function useCloseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['closeOrder'],
    mutationFn: (payload: CloseOrderPayload) => closeOrder(payload),
    onSuccess: () => {
      // Invalidate balance and orders cache when order is closed
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['closedOrders'] });
    },
    onError: (error) => {
      console.error('Failed to close order', error);
    },
  });
}
