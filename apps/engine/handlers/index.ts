import { prices, users } from '../memoryDb';
import type { PriceStore, User } from '../types';
import type {
  CloseOrderPayload,
  OpenTradePayload,
  UserCreated,
  UserPayload,
} from '../types/handler.types';
import { calculatePnl, closeOrder } from '../utils/liquidation-utils';
import { sendAcknowledgement } from '../utils/send-ack';

export async function handlePriceUpdateEntry(payload: PriceStore) {
  Object.assign(prices, payload);

  for (const user of Object.values(users)) {
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

export async function handleUserCreation(
  payload: UserCreated,
  requestId: string
) {
  try {
    const isUserExisting = users[payload.email];

    if (!isUserExisting) {
      const newUser: User = {
        id: payload.id,
        email: payload.email,
        balance: {
          amount: 5000,
          currency: 'USD',
        },
        trades: [],
      };

      users[payload.email] = newUser;
      console.log(`Success: ${payload.email}`);

      await sendAcknowledgement(requestId, 'USER_CREATED_SUCCESS', {
        status: 'success',
        userId: newUser.id,
      });
    } else {
      console.log(`User already exists with email: ${payload.email}`);

      await sendAcknowledgement(requestId, 'USER_CREATION_FAILED', {
        reason: 'User already exists',
        email: payload.email,
      });
    }
  } catch (err) {
    console.error('Error in handleUserCreation:', err);
    await sendAcknowledgement(requestId, 'USER_CREATION_ERROR', {
      message: err,
    });
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

    user.trades.push(trade);

    await sendAcknowledgement(requestId, 'TRADE_OPEN_ACKNOWLEDGEMENT', {
      status: 'success',
      openedTradeId: trade.id,
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
    const tradeIndex = user.trades.findIndex((trade) => trade.id === orderId);

    if (tradeIndex === -1) {
      console.log(`Trade with ID ${orderId} not found `);
      await sendAcknowledgement(requestId, 'TRADE_CLOSE_FAILED', {
        reason: 'Trade not found',
      });
      return;
    }

    const [closedTrade] = user.trades.splice(tradeIndex, 1);

    console.log(`Successfully closed trade ${orderId}`);

    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ACKNOWLEDGEMENT', {
      status: 'success',
      closedTradeId: closedTrade.id,
    });
  } catch (err) {
    console.error('Error in closing trade:', err);
    await sendAcknowledgement(requestId, 'TRADE_CLOSE_ERROR', {
      message: err,
    });
  }
}

export async function handleGetUserBalance(
  payload: UserPayload,
  requestId: string
) {
  try {
    const { email } = payload;
    const user = users[email];

    if (!user) {
      console.log(`Attempted to close trade for non-existent user: ${email}`);

      await sendAcknowledgement(requestId, 'GET_BALANCE_FAILED', {
        reason: 'User not found',
      });
      return;
    }

    await sendAcknowledgement(requestId, 'GET_BALANCE_ACKNOWLEDGEMENT', {
      status: 'success',
      balance: user.balance,
    });
  } catch (err) {
    console.error('Error in getting user balance:', err);
    await sendAcknowledgement(requestId, 'GET_BALANCE_ERROR', {
      message: err,
    });
  }
}
