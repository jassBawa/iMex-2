import type { RedisClientType } from 'redis';
import redisClient from './index.js';

export const redisStreamClient: RedisClientType = redisClient;

export default redisStreamClient;
