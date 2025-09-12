import { prices, users } from '../memoryDb';
import { mongodb } from '../utils/dbClient';

const SNAPSHOT_INTERVAL = 15_000; // 15 seconds

let lastSnapshotAt: number = Date.now();
let lastItemReadId = '';

export async function restoreSnapshot() {
  const collection = mongodb.collection('engine-snapshots');
  const result = await collection.findOne({ id: 'dump' });

  if (result) {
    Object.assign(prices, result.data.prices);
    Object.assign(users, result.data.users);
    lastSnapshotAt = result.data.lastSnapshotAt;
    lastItemReadId = result.data.lastItemReadId;
  } else {
    lastSnapshotAt = Date.now();
  }
}

export async function saveSnapshot() {
  const now = Date.now();
  if (now - lastSnapshotAt < SNAPSHOT_INTERVAL) return;

  const collection = mongodb.collection('engine-snapshots');
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
  lastSnapshotAt = now;
}

export function updateLastItemReadId(id: string) {
  lastItemReadId = id;
}

export function getLastItemReadId(): string {
  return lastItemReadId;
}
