import type { User } from '@prisma/client';
import { redisClient } from '../lib/redisClient';
import { RedisSubscriber } from './redis.service';

const redisSub = RedisSubscriber.getInstance();

export async function createUserInEngine(user: User) {
  const requestId = Date.now().toString();
  const payload = {
    type: 'USER_CREATED',
    requestId,
    data: JSON.stringify({
      email: user.email,
      id: user.id,
    }),
  };
  await redisClient.xAdd('stream:engine', '*', payload);
  await redisSub.waitForMessage(requestId);
}
