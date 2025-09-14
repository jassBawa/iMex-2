import redis, { type RedisClientType } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const client: RedisClientType = redis.createClient({
  url: redisUrl,
});

export default client;
export type RedisClientTypeFromPCKG = typeof client;
