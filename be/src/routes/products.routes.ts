import { Router } from 'express';

import { listProducts } from '../controller/products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', listProducts);
