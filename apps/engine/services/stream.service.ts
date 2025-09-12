import { redisStreamClient } from '@iMex/redis/redisStream';

const STREAM_KEY = 'stream:engine';
const GROUP_NAME = 'group';
const CONSUMER_NAME = 'consumer-1';

export async function createConsumerGroup() {
  try {
    await redisStreamClient.xGroupCreate(STREAM_KEY, GROUP_NAME, '0', {
      MKSTREAM: true,
    });
  } catch (err) {
    // Consumer group already exists
  }
}

export async function getStreamInfo() {
  const groups = await redisStreamClient.xInfoGroups(STREAM_KEY);
  return groups[0]?.['last-delivered-id']?.toString();
}

export async function readFromStream() {
  return (await redisStreamClient.xReadGroup(
    GROUP_NAME,
    CONSUMER_NAME,
    { key: STREAM_KEY, id: '>' },
    { BLOCK: 0 }
  )) as any[];
}

export async function acknowledgeMessage(messageId: string) {
  await redisStreamClient.xAck(STREAM_KEY, GROUP_NAME, messageId);
}

export async function replayMessages(fromId: string, toId: string) {
  const entries = await redisStreamClient.xRange(STREAM_KEY, fromId, toId);
  return entries.slice(1); // Skip the first entry as it's already processed
}

export const STREAM_CONFIG = {
  STREAM_KEY,
  GROUP_NAME,
  CONSUMER_NAME,
} as const;
