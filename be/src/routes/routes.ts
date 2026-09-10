import { Router } from 'express';

import { listProducts } from '../controller/products.controller.js';

export const apiRouter = Router();

apiRouter.get('/products', listProducts);
