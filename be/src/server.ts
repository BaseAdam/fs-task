import type { Server } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './db/connect.js';

let server: Server | undefined;
let shuttingDown = false;

async function shutdown(): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log('Shutting down...');

  try {
    if (server) {
      const running = server;
      await new Promise<void>((resolve, reject) => {
        running.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await disconnectDb();
    process.exit(0);
  } catch (error) {
    console.error('Shutdown failed:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

async function start(): Promise<void> {
  await connectDb(env.MONGODB_URI);

  server = createApp().listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  server.on('error', (error) => {
    console.error('HTTP server error:', error);
    process.exit(1);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start the API:', error);
  process.exit(1);
});
