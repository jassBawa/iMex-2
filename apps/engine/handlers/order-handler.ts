import { prices, users } from '../memoryDb';
import type { PriceStore, Trade } from '../types';
import type {
  CloseOrderPayload,
  OpenTradePayload,
} from '../types/handler.types';
import { calculatePnl, closeOrder } from '../utils/liquidation-utils';
import { sendAcknowledgement } from '../utils/send-ack';

export async function handlePriceUpdateEntry(payload: PriceStore) {
  // update in memory price
  Object.assign(prices, payload);

  for (const user of Object.values(users)) {
    // todo: update logic according to new one
    for (const order of [...user.trades]) {
      const currentPrices = prices[order.asset];
      if (!currentPrices?.buyPrice || !currentPrices?.sellPrice) {
        continue;
      }

      const { id, side, stopLoss, takeProfit, margin } = order;
      let pnlToRealize: number | null = null;
      let closeReason: string | null = null;

      const relevantPrice =
        side === 'LONG' ? currentPrices.buyPrice : currentPrices.sellPrice;

      if (side === 'LONG') {
        if (stopLoss && relevantPrice <= stopLoss) {
          pnlToRealize = calculatePnl(order, stopLoss);
          closeReason = 'Stop Loss';
        } else if (takeProfit && relevantPrice >= takeProfit) {
          pnlToRealize = calculatePnl(order, takeProfit);
          closeReason = 'Take Profit';
        }
      } else {
        // SHORT
        if (stopLoss && relevantPrice >= stopLoss) {
          pnlToRealize = calculatePnl(order, stopLoss);
          closeReason = 'Stop Loss';
        } else if (takeProfit && relevantPrice <= takeProfit) {
          pnlToRealize = calculatePnl(order, takeProfit);
          closeReason = 'Take Profit';
        }
      }

      if (!closeReason) {
        const unrealizedPnl = calculatePnl(order, relevantPrice);
        if (margin && unrealizedPnl < 0 && Math.abs(unrealizedPnl) >= margin) {
          pnlToRealize = unrealizedPnl;
          closeReason = 'Liquidation';
        }
      }

      if (closeReason && pnlToRealize !== null) {
        await closeOrder(user, id, pnlToRealize, closeReason);
      }
    }
  }
}

export async function handleOpenTrade(
  payload: OpenTradePayload,
  requestId: string
) {
  try {
    const { email, trade } = payload;

    const user = users[email];

    if (!user) {
      console.log(`Attempted to open trade for non-existent user: ${email}`);
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: 'User not found',
      });
    }

    const { asset, leverage, side, quantity, id, stopLoss, takeProfit } = trade;

    const currentPrice = prices[asset];
    if (!currentPrice) {
      console.log(`Price not available for asset: ${asset}`);
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: `Price for asset ${asset} is not available.`,
      });
      return;
    }

    const openPrice =
      side === 'LONG' ? currentPrice.buyPrice : currentPrice.sellPrice;
    const marginRequired = (quantity * openPrice) / leverage;

    if (user.balance.amount < marginRequired) {
      await sendAcknowledgement(requestId, 'TRADE_OPEN_FAILED', {
        reason: 'Insufficient balance',
        marginRequired: marginRequired,
        availableBalance: user.balance.amount,
      });
      return;
    }

    user.balance.amount -= marginRequired;

    const newTrade: Trade = {
      id,
      asset,
      leverage,
      side,
      quantity,
      margin: marginRequired,
      status: 'OPEN',
      openPrice,
      stopLoss,
      takeProfit,
      createdAt: new Date(),
    };

    user.trades.push(newTrade);

    await sendAcknowledgement(requestId, 'TRADE_OPEN_ACKNOWLEDGEMENT', {
      status: 'success',
      tradeDetails: newTrade,
    });
  } catch (err) {
    console.error('Error in handleOpenTrade:', err);
    await sendAcknowledgement(requestId, 'TRADE_OPEN_ERROR', { message: err });
  }
}

export async function handleCloseTrade(
  payload: CloseOrderPayload,
  requestId: string
) {
  try {
    const { email, orderId } = payload;
    const user = users[email];

    if (!user) {
      console.log(`Attempted to close trade for non-existent user: ${email}`);

      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: 'User not found',
      });
      return;
    }
    const tradeToClose = user.trades.find(
      (trade) => trade.id === orderId && trade.status === 'OPEN'
    );

    if (!tradeToClose) {
      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: 'Open trade not found',
      });
      return;
    }

    const { asset, side, openPrice, quantity, margin } = tradeToClose;

    const currentPrice = prices[asset];
    if (!currentPrice) {
      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: `Cannot close trade, price for asset ${asset} is not available.`,
      });
      return;
    }

    const closePrice =
      side === 'LONG' ? currentPrice.sellPrice : currentPrice.buyPrice;

    let pnl = 0;
    if (side === 'LONG') {
      pnl = (closePrice - openPrice) * quantity;
    } else {
      pnl = (openPrice - closePrice) * quantity;
    }

    user.balance.amount += margin + pnl;
    tradeToClose.status = 'CLOSED';
    tradeToClose.closePrice = closePrice;
    tradeToClose.pnl = pnl;
    tradeToClose.closedAt = new Date();

    console.log(`Successfully closed trade ${orderId}. PnL: ${pnl}`);

    // todo: add to db

    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ACKNOWLEDGEMENT', {
      status: 'success',
      tradeDetails: tradeToClose,
    });
  } catch (err) {
    console.error('Error in closing trade:', err);
    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ERROR', {
      message: err,
    });
  }
}
