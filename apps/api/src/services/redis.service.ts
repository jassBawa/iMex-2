import { createClient, type RedisClientType } from 'redis';

export const ACKNOWLEDGEMENT_QUEUE = 'stream:engine:acknowledgement';
export class RedisSubscriber {
  private static instance: RedisSubscriber;
  private client: RedisClientType;
  private callbacks: Record<string, { resolve: any; reject: any }>;

  private constructor() {
    this.client = createClient();
    this.client.connect();
    this.callbacks = {};
    this.runLoop();
  }

  static getInstance(): RedisSubscriber {
    if (!RedisSubscriber.instance) {
      RedisSubscriber.instance = new RedisSubscriber();
    }
    return RedisSubscriber.instance;
  }

  async runLoop() {
    while (1) {
      const response = await this.client.xRead(
        {
          key: ACKNOWLEDGEMENT_QUEUE,
          id: '$',
        },
        { BLOCK: 0 }
      );

      if (response) {
        const message = response[0]?.messages[0].message;
        const reqType = message.type;
        const gotId = message.requestId;
        const payload = JSON.parse(message.payload);

        switch (reqType) {
          case 'USER_CREATED_SUCCESS':
          case 'TRADE_OPEN_ACKNOWLEDGEMENT':
          case 'TRADE_CLOSE_ACKNOWLEDGEMENT':
          case 'GET_BALANCE_ACKNOWLEDGEMENT':
          case 'TRADE_FETCH_ACKNOWLEDGEMENT':
            this.callbacks[gotId]!.resolve(payload);
            delete this.callbacks[gotId];
            break;

          case 'USER_CREATION_FAILED':
          case 'USER_CREATION_ERROR':
          case 'TRADE_OPEN_FAILED':
          case 'TRADE_OPEN_ERROR':
          case 'GET_BALANCE_FAILED':
          case 'GET_BALANCE_ERROR':
          case 'TRADE_CLOSE_FAILED':
          case 'TRADE_SLIPPAGE_MAX_EXCEEDED':
          case 'GET_BALANCE_FAILED':
          case 'TRADE_FETCH_FAILED':
          case 'SOMETHING_WENT_WRONG':
            this.callbacks[gotId]!.reject(payload);
            delete this.callbacks[gotId];
            break;
        }
      }

      // resolving the promise
    }
  }

  waitForMessage(callbackId: string) {
    return new Promise<any>((resolve, reject) => {
      // making the resolve function accessible
      this.callbacks[callbackId] = { resolve, reject };
      setTimeout(() => {
        // rejecting if not process in 5 seconds
        if (this.callbacks[callbackId]) {
          delete this.callbacks[callbackId];
          reject();
        }
      }, 3500);
    });
  }
}
