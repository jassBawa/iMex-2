import { processMessage } from './handlers';
import { prices, users } from './memoryDb';
import { db } from './utils/dbClient';
import { client } from './utils/redis-client';

const STREAM_KEY = 'stream:engine';
const GROUP_NAME = 'group';
const CONSUMER_NAME = 'consumer-1';
const SNAPSHOT_INTERVAL = 10_000; // 10s

let lastSnapshotAt: number;
let lastItemReadId = '';

async function restoreSnapshot() {
  const collection = db.collection('engine-snapshots');
  const result = await collection.findOne({ id: 'dump' });

  if (result) {
    Object.assign(prices, result.data.prices);
    Object.assign(users, result.data.users);
    lastSnapshotAt = result.data.lastSnapshotAt;
    lastItemReadId = result.data.lastItemReadId;
    console.log('Restored snapshot from DB');
  } else {
    console.log('No snapshot found, starting fresh');
  }
}

async function saveSnapshot() {
  const now = Date.now();
  if (now - lastSnapshotAt < SNAPSHOT_INTERVAL) return;

  const collection = db.collection('engine-snapshots');
  const snapshot = {
    id: 'dump',
    data: {
      prices,
      users,
      lastSnapshotAt: now,
      lastItemReadId,
    },
  };

  await collection.updateOne(
    { id: 'dump' },
    { $set: snapshot },
    { upsert: true }
  );
  console.log('Snapshot saved');
  lastSnapshotAt = now;
}

async function startEngine() {
  try {
    await client.xGroupCreate(STREAM_KEY, GROUP_NAME, '0', { MKSTREAM: true });
  } catch (err) {
    console.log('Consumer group exists');
  }

  await restoreSnapshot();

  while (true) {
    if (lastItemReadId) {
      await client.xAck(STREAM_KEY, GROUP_NAME, lastItemReadId);
    }

    const response = (await client.xReadGroup(
      GROUP_NAME,
      CONSUMER_NAME,
      { key: STREAM_KEY, id: '>' },
      { BLOCK: 0 }
    )) as any[];

    if (response) {
      const msg = response[0].messages[0];
      lastItemReadId = msg.id;

      await processMessage(msg);
    }

    await saveSnapshot();
  }
}

client.on('connect', startEngine);

client.on('error', () => {
  console.log('Redis connection error');
});
