import type { Request, Response } from 'express';
import { RedisSubscriber } from '../services/redis.service';
import { closeOrderSchema, openOrderSchema } from '../validations/ordersSchema';
import { redisClient } from '../lib/redisClient';

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

    await redisSubscriber.waitForMessage(requestId);

    res.status(201).json({
      message: 'Order placed',
      requestId: requestId,
    });
  } catch (err: any) {
    console.log(err);
    res.status(411).json({
      message: 'Trade not placed',
    });
  }
}

export async function closeOrder(req: Request, res: Response) {
  const startTime = Date.now();

  const { success, data } = closeOrderSchema.safeParse(req.body);

  if (!success) {
    res.status(400).json({ message: 'Order id missing ' });
    return;
  }

  const { orderId } = data;

  const requestId = Date.now().toString();
  const payload = JSON.stringify({
    requestId,
    orderId,
  });

  await redisClient.xAdd(CREATE_ORDER_QUEUE, '*', {
    payload,
    kind: 'ORDER_UPDATE',
    userId: 'jass',
  });

  try {
    await redisSubscriber.waitForMessage(requestId);

    res.status(201).json({
      message: 'Order placed',
      time: Date.now() - startTime,
    });
  } catch (err: any) {
    res.status(411).json({
      message: 'Trade not placed',
    });
  }
}
