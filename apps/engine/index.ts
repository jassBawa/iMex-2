import { createClient } from 'redis';
import { users, type OpenTrade } from './memoryDb';

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

    // console.log(messages[0])
    const payload = messages[0].message;

    if (payload.type === 'PRICE_UPDATE') {
      // console.log("handle price update");
      // console.log(payload)
    } else if (payload.type === 'ORDER') {
      console.log('handle trade');
      console.log(payload);
      const data = JSON.parse(payload.data);
      handleTradeExecution(data, payload.userId);
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

async function handleUpdateLocalPrices() {}
