import type { Request, Response } from 'express';
import { createClient } from 'redis';
import { RedisSubscriber } from '../services/redis.service';
const client = createClient();

client.connect();

export const CREATE_ORDER_QUEUE = 'trades';

const redisSubscriber = new RedisSubscriber();

export async function createOrder(
  req: Request,
  res: Response,
) {
  const startTime = Date.now();

  const { asset, qty, side, leverage } = req.body;
  const id = Date.now().toString();
  const data = JSON.stringify({
    id,
    asset,
    qty,
    side,
    leverage,
  });

  await client.xAdd(CREATE_ORDER_QUEUE, '*', { data, "type": "ORDER", userId: 'jass' });

  // res.json({
  //   id,
  //   startTime
  // })
  try {
    const responseFromEngine = await redisSubscriber.waitForMessage(id);

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

export async function closeOrder(
  req: Request,
  res: Response,
) {
  const startTime = Date.now();

  const { orderId } = req.body;
  const id = Date.now().toString();
  const data = JSON.stringify({
    id,
    orderId
  });

  await client.xAdd(CREATE_ORDER_QUEUE, '*', { data, "type": "ORDER", userId: 'jass' });

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
