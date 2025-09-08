import type { Request, Response } from 'express';
import { RedisSubscriber } from '../services/redis.service';
import { closeOrderSchema, openOrderSchema } from '../validations/ordersSchema';
import { redisClient } from '../lib/redisClient';
import { randomUUID } from 'crypto';

export const CREATE_ORDER_QUEUE = 'stream:engine';

const redisSubscriber = RedisSubscriber.getInstance();

export async function createOrder(req: Request, res: Response) {
  const { success, data, error } = openOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ error: error.flatten().fieldErrors });
    return;
  }

  const { asset, leverage, quantity, slippage, side, stopLoss, takeProfit } =
    data;
  try {
    const requestId = Date.now().toString();

    const payload = {
      type: 'CREATE_ORDER',
      requestId: requestId,
      data: JSON.stringify({
        email: req.user,
        trade: {
          id: randomUUID(),
          asset,
          quantity,
          side,
          leverage,
          slippage,
          stopLoss,
          takeProfit,
        },
      }),
    };

    await redisClient.xAdd(CREATE_ORDER_QUEUE, '*', payload);

    const { openedTradeId } = await redisSubscriber.waitForMessage(requestId);
    console.log(openedTradeId);

    res.status(201).json({
      message: 'Order placed',
      orderId: openedTradeId,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      message: 'Something went wrong',
    });
  }
}

export async function closeOrder(req: Request, res: Response) {
  const { success, data } = closeOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: 'Orderid id missing ' });
    return;
  }

  const { orderId } = data;

  const requestId = Date.now().toString();

  const payload = {
    type: 'CLOSE_ORDER',
    requestId: requestId,
    data: JSON.stringify({
      email: req.user,
      orderId: orderId,
    }),
  };

  await redisClient.xAdd(CREATE_ORDER_QUEUE, '*', payload);

  try {
    const { status, reason } = await redisSubscriber.waitForMessage(requestId);

    res.status(201).json({
      message: 'Order closed',
    });
  } catch (err: any) {
    console.log('err', err);
    res.status(500).json({
      message: 'Something went wrong: ' + err.reason,
    });
  }
}
