import cors from 'cors';
import express, { type Express } from 'express';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { isDbConnected } from './db/connect.js';
import { openApiDocument } from './docs/openapi.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { productsRouter } from './routes/products.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));

  app.get('/api/health-check', (_req, res) => {
    const connected = isDbConnected();

    res.status(connected ? 200 : 503).json({
      status: connected ? 'ok' : 'degraded',
      db: connected ? 'connected' : 'disconnected',
    });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
