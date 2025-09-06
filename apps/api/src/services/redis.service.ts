import { createClient, type RedisClientType } from 'redis';

export const CALLBACK_QUEUE = 'callback-queue';
export class RedisSubscriber {
  private client: RedisClientType;
  private callbacks: Record<string, () => void>;

  constructor() {
    this.client = createClient();
    this.client.connect();
    this.runLoop();
    this.callbacks = {}
  }

  async runLoop() {
      while (1) {
      const response = await this.client.xRead(
        {
          key: CALLBACK_QUEUE,
          id: '$',
        },
        { BLOCK: 0 }
      );

      if(response){
        if(response[0]?.messages[0].message){
          const gotId = response[0]?.messages[0].message.id;
          this.callbacks[gotId]();       
          delete this.callbacks[gotId];
        }
      }

      // resolving the promise
    }
  }

  waitForMessage(callbackId: string) {
    return new Promise((resolve, reject) => {
        
        // making the resolve function accessible
        // @ts-ignore
        this.callbacks[callbackId] = resolve;

        setTimeout(() => {

            // rejecting if not process in 5 seconds
            if(this.callbacks[callbackId]){
              delete this.callbacks[callbackId];
                reject();
            }
        }, 3500);
    })
  }
}
