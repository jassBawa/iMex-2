import type { AsksBids, Trade, User } from '../types';
import prisma from '@imex/db';

export async function closeOrder(
  user: User,
  orderId: string,
  realizedPnl: number,
  reason: string,
  currentPrice: AsksBids
) {
  const tradeIndex = user.trades.findIndex((trade) => trade.id === orderId);
  if (tradeIndex === -1) {
    return;
  }

  const [closedTrade] = user.trades.splice(tradeIndex, 1);

  const { asset, side, openPrice, quantity, margin, leverage, slippage } =
    closedTrade;

  const closePrice =
    side === 'LONG'
      ? currentPrice.sellPrice / 10 ** currentPrice.decimal
      : currentPrice.buyPrice / 10 ** currentPrice.decimal;

  let pnl = 0;
  if (side === 'LONG') {
    pnl = (closePrice - openPrice) * quantity;
  } else {
    pnl = (openPrice - closePrice) * quantity;
  }

  // todo: remove from memory
  user.balance.amount += margin + pnl * leverage;
  closedTrade.status = 'CLOSED';
  closedTrade.closePrice = closePrice;
  closedTrade.pnl = pnl * leverage;
  closedTrade.closedAt = new Date();

  console.log(`Successfully closed trade ${orderId}. PnL: ${pnl}`);

  await prisma.existingTrade.create({
    data: {
      userId: user.id,
      asset: asset,
      openPrice: openPrice,
      closePrice: closePrice,
      leverage: leverage,
      pnl: pnl,
      liquidated: true,
      createdAt: new Date(),
      slippage: slippage,
    },
  });

  await prisma.user.update({
    where: {
      email: user.email,
    },
    data: {
      balance: user.balance.amount,
    },
  });

  user.trades = user.trades.filter((trade) => trade.id !== orderId);

  if (closedTrade.margin) {
    user.balance.amount += closedTrade.margin + realizedPnl;
  }

  console.log(`Trade ${orderId} closed. Reason: ${reason}.`);
}

export function calculatePnl(order: Trade, closePrice: number): number {
  if (order.side === 'LONG') {
    return (closePrice - order.openPrice) * order.quantity * order.leverage;
  } else {
    return (order.openPrice - closePrice) * order.quantity * order.leverage;
  }
}
