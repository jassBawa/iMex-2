import type { Request, Response } from 'express';
import { createClient } from 'redis';
import { RedisSubscriber } from '../services/redis.service';
import { closeOrderSchema, openOrderSchema } from '../validations/ordersSchema';

const client = createClient();

client.connect();

export const CREATE_ORDER_QUEUE = 'trades';

const redisSubscriber = new RedisSubscriber();

export async function createOrder(req: Request, res: Response) {
  const parsedData = openOrderSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ message: 'Invalid inputs ' });
    return;
  }

  const { asset, leverage, quantity, slippage, type } = parsedData.data;

  const id = Date.now().toString();

  const data = JSON.stringify({
    id,
    asset,
    quantity,
    type,
    leverage,
    slippage,
  });

  await client.xAdd(CREATE_ORDER_QUEUE, '*', {
    data,
    kind: 'ORDER_UPDATE',
    userId: 'jass',
  });

  try {
    await redisSubscriber.waitForMessage(id);

    res.status(201).json({
      message: 'Order placed',
      orderId: id,
    });
  } catch (err: any) {
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

  const id = Date.now().toString();
  const payload = JSON.stringify({
    id,
    orderId,
  });

  await client.xAdd(CREATE_ORDER_QUEUE, '*', {
    payload,
    kind: 'ORDER_UPDATE',
    userId: 'jass',
  });

  try {
    await redisSubscriber.waitForMessage(id);

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
