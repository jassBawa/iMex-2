import redis, { type RedisClientType } from 'redis';

const client: RedisClientType = redis.createClient({
  url: process.env.REDIS_URL!,
});

export default client;
export type TypeOfRedisClient = RedisClientType;
