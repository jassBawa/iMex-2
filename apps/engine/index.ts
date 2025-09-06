import { createClient } from 'redis';
import { handlePriceUpdateEntry, handleUserCreation } from './handlers';

const client = createClient();

client.connect();

client.on('connect', async () => {
  while (1) {
    const response = await client.xRead(
      {
        key: 'trades',
        id: '$',
      },
      {
        BLOCK: 0,
      }
    );

    let messages;
    if (response) {
      if (response[0]?.messages[0].message) {
        messages = response[0]?.messages;
      }
    }

    // console.log(name)
    if (!messages || messages.length === 0) {
      continue;
    }


    const payload = messages[0].message;
    if (payload.type === 'PRICE_UPDATE') {
      const data = JSON.parse(payload.data);
      handlePriceUpdateEntry(data);
    } else if (payload.type === 'ORDER') {
      console.log(payload);
      const data = JSON.parse(payload.data);
      handleTradeExecution(data, payload.userId);
    } else if (payload.type === 'USER_CREATED') {
      const parsedData = JSON.parse(payload.data);
      handleUserCreation(parsedData);
    }
  }
});

interface Trade {
  id: string;
  asset: string;
  qty: number;
  side: string;
  leverage: number;
}

async function handleTradeExecution(data: Trade, userId: string) {
  const order = {
    ...data,
    pnl: 1,
    liquidated: false,
  };

  // business logic
  // users[userId].trades.push(order as any)
  // update user balance
  //

  client.xAdd('callback-queue', '*', {
    id: data.id,
  });
}
