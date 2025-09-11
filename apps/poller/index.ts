import { createClient } from 'redis';

const client = createClient();

await client.connect();

const ws = new WebSocket('wss://ws.backpack.exchange/');

let assets: Record<string, {}> = {};

const message = {
  method: 'SUBSCRIBE',
  params: ['bookTicker.SOL_USDC'],
  id: 1,
};

ws.onopen = (event) => {
  console.log('Connected to binance');

  ws.send(JSON.stringify(message));
};

ws.onmessage = async (event) => {
  const { data } = event;
  const parseData = JSON.parse(data).data as Trade;
  const [decimal, integer] = getIntAndDecimal(parseData.a);

  const pricePlusOnePercent = Math.round(integer * 1.01);
  assets[parseData.s] = {
    buyPrice: pricePlusOnePercent,
    sellPrice: integer,
    decimal: decimal,
  };
};

ws.onclose = () => {
  console.log('WebSocket Closed');
};

setInterval(() => {
  if (Object.keys(assets).length === 0) {
    return;
  }
  const data = {
    data: JSON.stringify(assets),
    type: 'PRICE_UPDATE',
  };
  client.xAdd('stream:engine', '*', data);
}, 4000);

interface Trade {
  A: string;
  B: string;
  E: number;
  T: number;
  a: string;
  b: string;
  e: string;
  s: string;
  u: number;
}

function getIntAndDecimal(price: string) {
  const arr = price.split('.');
  const decimal = arr[1].length;

  const integer = Number(arr.join(''));

  return [decimal, integer];
}
