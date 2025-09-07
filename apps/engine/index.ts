import { createClient } from 'redis';
import {
  handlePriceUpdateEntry,
  handleOpenTrade,
  handleUserCreation,
  handleCloseTrade,
} from './handlers';

const client = createClient();

client.connect();

client.on('connect', async () => {
  while (1) {
    const response = (await client.xRead(
      {
        key: 'trades',
        id: '$',
      },
      {
        BLOCK: 0,
      }
    )) as any[];

    if (response) {
      const requestId = response[0]?.messages[0]?.message.reqId;
      const requestType = response[0]?.messages[0]?.message.type;

      const payload = response[0].messages[0].message;
      const data = JSON.parse(payload.data);
      console.log(payload);

      switch (requestType) {
        case 'USER_CREATED':
          handleUserCreation(data, requestId);
          return;
        case 'CREATE_ORDER':
          handleOpenTrade(data, requestId);
          return;
        case 'CLOSE_ORDER':
          handleCloseTrade(data, requestId);
          return;
        case 'PRICE_UPDATE':
          handlePriceUpdateEntry(data);
          return;
        case 'GET_USER_BALANCE':
        //todo: impl this
          // handleGetUserBalance(data, requestId);
          return;
        case 'GET_USER_ASSET_BALANCE':
          return;
        default:
          console.log('Irrelevant event recieved');
      }
    }
  }
});
