import type { RequestHandler } from 'express';

import { NotFoundError } from '../errors/appError.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
};
