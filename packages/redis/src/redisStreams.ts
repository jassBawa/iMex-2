import type { RedisClientType } from 'redis';
import redisClient from './index.js';

export const pricePusher: RedisClientType = redisClient.duplicate();
export const enginePuller: RedisClientType = redisClient.duplicate();
export const enginePusher: RedisClientType = redisClient.duplicate();
export const engineResponsePuller: RedisClientType = redisClient.duplicate();
export const httpPusher: RedisClientType = redisClient.duplicate();
