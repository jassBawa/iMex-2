import { createClient } from 'redis';
import { prices, users } from '../memoryDb';
import type { PriceStore, User } from '../types';
import { sendAcknowledgement } from '../utils/send-ack';
import type {
  CloseOrderPayload,
  OpenTradePayload,
  UserCreated,
} from '../types/handler.types';

const client = createClient();
client.connect();

export async function handlePriceUpdateEntry(payload: PriceStore) {
  // update total price
  Object.assign(prices, payload);

  for (const user of Object.values(users)) {
    user.trades.forEach((order) => {
      const currentPrices = prices[order.asset];
      if (!currentPrices?.buyPrice || !currentPrices?.sellPrice) {
        // there's no price data for this asset yet, skip it.
        return;
      }

      const { id, openPrice, quantity, side, stopLoss, takeProfit } = order;
      let realizedPnl = 0;

      if (side === 'LONG') {
        // stoploss
        if (stopLoss && currentPrices.sellPrice <= stopLoss) {
          realizedPnl = (stopLoss - openPrice) * quantity;
          console.log('Stop loss triggered for long order', id);
        }
        // takeprofit
        else if (takeProfit && currentPrices.sellPrice >= takeProfit) {
          realizedPnl = (takeProfit - openPrice) * quantity;
          console.log('take profit triggered for long order', id);
        }
      } else if (side === 'SHORT') {
        // stoploss
        if (stopLoss && currentPrices.buyPrice >= stopLoss) {
          realizedPnl = (openPrice - stopLoss) * quantity;
          console.log('Stop loss triggered for long order', id);
        }
        // takeprofit
        else if (takeProfit && currentPrices.buyPrice >= takeProfit) {
          realizedPnl = (openPrice - takeProfit) * quantity;
          console.log('take profit triggered for long order', id);
        }
      }

      if (
        order.margin &&
        realizedPnl < 0 &&
        Math.abs(realizedPnl) >= order.margin
      ) {
        // liquidate(order, liquidationPrice, unrealizedPnl);
        return;
      }
    });
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

      await sendAcknowledgement(requestId, 'user-created-success', {
        status: 'success',
        userId: newUser.id,
      });
    } else {
      console.log(`User already exists with email: ${payload.email}`);

      await sendAcknowledgement(requestId, 'user-creation-failed', {
        reason: 'User already exists',
        email: payload.email,
      });
    }
  } catch (err) {
    console.error('Error in handleUserCreation:', err);
    await sendAcknowledgement(requestId, 'user-creation-error', {
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
      await sendAcknowledgement(requestId, 'trade-open-failed', {
        reason: 'User not found',
      });
      return;
    }

    user.trades.push(trade);

    await sendAcknowledgement(requestId, 'trade-open-acknowledgement', {
      status: 'success',
      openedTradeId: trade.id,
    });
  } catch (err) {
    console.error('Error in handleOpenTrade:', err);
    await sendAcknowledgement(requestId, 'trade-open-error', { message: err });
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

      await sendAcknowledgement(requestId, 'trade-close-failed', {
        reason: 'User not found',
      });
      return;
    }

    const tradeIndex = user.trades.findIndex((trade) => trade.id === orderId);

    if (tradeIndex === -1) {
      console.log(`Trade with ID ${orderId} not found `);
      await sendAcknowledgement(requestId, 'trade-close-failed', {
        reason: 'Trade not found',
      });
      return;
    }

    const [closedTrade] = user.trades.splice(tradeIndex, 1);

    console.log(`Successfully closed trade ${orderId}`);

    await sendAcknowledgement(requestId, 'trade-close-acknowledgement', {
      status: 'success',
      closedTradeId: closedTrade.id,
    });
  } catch (err) {
    console.error('Error in handleCloseTrade:', err);
    await sendAcknowledgement(requestId, 'trade-close-error', {
      message: err,
    });
  }
}
