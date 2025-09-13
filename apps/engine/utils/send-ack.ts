import { enginePusher } from '@iMex/redis/redis-streams';

(async () => {
  await enginePusher.connect();
})();

export const ACKNOWLEDGEMENT_STREAM = 'stream:engine:acknowledgement';

export async function sendAcknowledgement(
  requestId: string,
  type: string,
  payload: Record<string, any> = {}
) {
  try {
    console.log('ENTERED SEND ACKNOWLEDGEMENT_STREAM');
    const message = {
      payload: JSON.stringify({
        ...payload,
      }),
      type,
      requestId,
    };
    console.log('message', message);
    await enginePusher.xAdd(ACKNOWLEDGEMENT_STREAM, '*', message);
  } catch (err) {
    console.error(
      `[Acknowledgement Error] Failed to send ACK for request ID ${requestId}:`,
      err
    );
  }
}
