import { subscriber } from '@imex/redis/pubSub';
import { WebSocketServer, WebSocket } from 'ws';
import 'dotenv/config';

const PORT = Number(process.env.WS_PORT) || 8080;
const PRICE_UPDATE_CHANNEL = 'ws:price:update';

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`✅ WebSocket server is listening on port ${PORT}`);
});

wss.on('connection', (ws: WebSocket) => {
  console.log('🔌 Client connected');
  ws.on('close', () => console.log('🔌 Client disconnected'));
});

const handlePriceUpdate = (message: string) => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
};

const main = async () => {
  try {
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    subscriber.on('error', (err) => console.error('Redis Client Error:', err));

    await subscriber.connect();
    console.log('✅ Connected to Redis subscriber');

    await subscriber.subscribe(PRICE_UPDATE_CHANNEL, handlePriceUpdate);
    console.log(`👂 Subscribed to Redis channel: '${PRICE_UPDATE_CHANNEL}'`);
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

const cleanup = async () => {
  console.log('\n🔌 Shutting down gracefully...');

  try {
    await subscriber.unsubscribe(PRICE_UPDATE_CHANNEL);
    await subscriber.quit();
    console.log('Redis connection closed.');
  } catch (err) {
    console.error('Error during Redis cleanup:', err);
  }

  wss.close((err) => {
    if (err) {
      console.error('Error closing WebSocket server:', err);
    }
    console.log('WebSocket server closed.');
    process.exit(0);
  });
};

main();
