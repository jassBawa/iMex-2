import redis, { type RedisClientType } from 'redis';

const client: RedisClientType = redis.createClient();

export default client;
export type RedisClientTypeFromPCKG = typeof client;
