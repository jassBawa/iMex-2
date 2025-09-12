import type { User } from '@prisma/client';
import { RedisSubscriber } from './redis.service';
import { redisStreamClient } from '@iMex/redis/redisStream';

const redisSub = RedisSubscriber.getInstance();

export async function createUserInEngine(user: User) {
  const requestId = Date.now().toString();
  const payload = {
    type: 'USER_CREATED',
    requestId,
    data: JSON.stringify({
      email: user.email,
      id: user.id,
      balance: user.balance,
    }),
  };
  await redisStreamClient.xAdd('stream:engine', '*', payload);
  await redisSub.waitForMessage(requestId);
}

export async function getUserBalanceFromEngine(email: string) {
  const requestId = Date.now().toString();
  const payload = {
    type: 'GET_USER_BALANCE',
    requestId,
    data: JSON.stringify({
      email: email,
    }),
  };
  await redisStreamClient.xAdd('stream:engine', '*', payload);
  const res = await redisSub.waitForMessage(requestId);

  return res.balance;
}
