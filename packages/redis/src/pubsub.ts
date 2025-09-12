import type { RedisClientType } from 'redis';
import redisClient from './index.js';

export const publisher: RedisClientType = redisClient.duplicate();

export const subscriber: RedisClientType = redisClient.duplicate();
