import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './db/connect.js';

async function shutdown(): Promise<void> {
  console.log('Shutting down...');
  await disconnectDb();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function start(): Promise<void> {
  await connectDb(env.MONGODB_URI);

  createApp().listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start the API:', error);
  process.exit(1);
});
