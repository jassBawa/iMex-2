import { redisStreamClient } from '@iMex/redis/redisStream';
import { startEngine } from './services/engine.service';

async function initializeEngine() {
  try {
    if (!redisStreamClient.isOpen) {
      await redisStreamClient.connect();
    }

    await startEngine();
  } catch (error) {
    console.error('Engine initialization failed:', error);
    process.exit(1);
  }
}

redisStreamClient.on('error', (error) => {
  console.error('Redis connection error:', error);
});

process.on('SIGINT', async () => {
  if (redisStreamClient.isOpen) await redisStreamClient.quit();
});

process.on('SIGTERM', async () => {
  if (redisStreamClient.isOpen) await redisStreamClient.quit();
});

// Initialize the engine
initializeEngine();
