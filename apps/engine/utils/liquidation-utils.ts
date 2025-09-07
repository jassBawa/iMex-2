import type { Trade, User } from '../types';

export async function closeOrder(
  user: User,
  orderId: string,
  realizedPnl: number,
  reason: string
) {
  const tradeIndex = user.trades.findIndex((trade) => trade.id === orderId);
  if (tradeIndex === -1) {
    return;
  }

  const [closedTrade] = user.trades.splice(tradeIndex, 1);

  if (closedTrade.margin) {
    user.balance.amount += closedTrade.margin + realizedPnl;
  }

  console.log(`Trade ${orderId} closed. Reason: ${reason}.`);
}

export function calculatePnl(order: Trade, closePrice: number): number {
  if (order.side === 'LONG') {
    return (closePrice - order.openPrice) * order.quantity;
  } else {
    return (order.openPrice - closePrice) * order.quantity;
  }
}
