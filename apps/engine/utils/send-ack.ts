import { createClient } from "redis";

const client = createClient();
client.connect();


const ACKNOWLEDGEMENT_STREAM = 'stream:engine:acknowledgement';

export async function sendAcknowledgement(requestId: string, type: string, payload: Record<string, any> = {}) {
  try {
    const message = {
      ...payload,
      type,
      requestId,
    };
    
    await client.xAdd(ACKNOWLEDGEMENT_STREAM, '*', message);

  } catch (err) {
    console.error(`[Acknowledgement Error] Failed to send ACK for request ID ${requestId}:`, err);
  }
}
