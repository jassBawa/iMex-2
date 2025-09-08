import {
  handleCloseTrade,
  handleOpenTrade,
  handlePriceUpdateEntry,
} from './handlers';
import {
  handleGetUserBalance,
  handleUserCreation,
} from './handlers/user-handler';
import { client } from './utils/redis-client';

client.on('connect', async () => {
  while (1) {
    const response = (await client.xRead(
      {
        key: 'stream:engine',
        id: '$',
      },
      {
        BLOCK: 0,
      }
    )) as any[];
    if (response) {
      const requestId = response[0]?.messages[0]?.message.requestId;
      const requestType = response[0]?.messages[0]?.message.type;

      const payload = response[0].messages[0].message;
      const data = JSON.parse(payload.data);
      switch (requestType) {
        case 'USER_CREATED':
          handleUserCreation(data, requestId);
          break;
        case 'CREATE_ORDER':
          handleOpenTrade(data, requestId);
          break;
        case 'CLOSE_ORDER':
          handleCloseTrade(data, requestId);
          break;
        case 'PRICE_UPDATE':
          handlePriceUpdateEntry(data);
          break;
        case 'GET_USER_BALANCE':
          handleGetUserBalance(data, requestId);
          break;
        // case 'GET_USER_ASSET_BALANCE':
        // return;
        default:
          console.log('Irrelevant event recieved');
      }
    }
  }
});

client.on('error', () => {
  console.log('Redis connection closed due to some error');
});
