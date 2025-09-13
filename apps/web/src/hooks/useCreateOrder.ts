import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export type OrderPayload = {
  asset: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  leverage: number;
  slippage: number;
  tradeOpeningPrice: number;
  stopLoss?: number;
  takeProfit?: number;
};

export async function createOrder(payload: OrderPayload) {
  const { data } = await api.post('/trade/create-order', payload);
  return data;
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['createOrder'],
    mutationFn: (payload: OrderPayload) => createOrder(payload),
    onSuccess: () => {
      // Invalidate balance and orders cache when order is created
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['openOrders'] });
      queryClient.invalidateQueries({ queryKey: ['closedOrders'] });
    },
  });
}
