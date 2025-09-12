import { processMessage } from '../handlers';
import {
  createConsumerGroup,
  getStreamInfo,
  readFromStream,
  acknowledgeMessage,
  replayMessages,
  STREAM_CONFIG,
} from './stream.service';
import {
  restoreSnapshot,
  saveSnapshot,
  updateLastItemReadId,
  getLastItemReadId,
} from './snapshot.service';

export async function startEngine() {
  // Setup consumer group
  await createConsumerGroup();

  // Restore previous state
  await restoreSnapshot();

  // Check for missed messages and replay if needed
  const lastDeliveredId = await getStreamInfo();
  const lastItemReadId = getLastItemReadId();

  if (
    lastDeliveredId &&
    lastItemReadId !== '' &&
    lastItemReadId !== lastDeliveredId
  ) {
    await replayMissedMessages(lastItemReadId, lastDeliveredId);
  }

  // Main processing loop
  await processMessages();
}

async function processMessages() {
  while (true) {
    const lastItemReadId = getLastItemReadId();

    // Acknowledge previous message if exists
    if (lastItemReadId) {
      await acknowledgeMessage(lastItemReadId);
    }

    // Read new messages
    const response = await readFromStream();

    if (response && response.length > 0) {
      const msg = response[0].messages[0];
      updateLastItemReadId(msg.id);

      // Process the message
      await processMessage(msg);
    }

    // Save snapshot periodically
    await saveSnapshot();
  }
}

async function replayMissedMessages(fromId: string, toId: string) {
  const missedMessages = await replayMessages(fromId, toId);

  for (const entry of missedMessages) {
    try {
      const msg = entry.message;
      // Note: Don't send acknowledgement for replayed messages
      // await processMessage(msg);
      updateLastItemReadId(entry.id);
    } catch (err) {
      console.error('Replay failed for message:', entry.id, err);
    }
  }
}
