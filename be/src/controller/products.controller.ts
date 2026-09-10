import type { Request, RequestHandler } from 'express';
import { z } from 'zod';

import { BadRequestError } from '../errors/appError.js';
import { getProducts } from '../service/products.service.js';

const querySchema = z.object({
  search: z.string().trim().min(1).optional(),
  capacity: z.coerce.number().positive().optional(),
  energyClass: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
  feature: z.string().trim().min(1).optional(),
  sort: z.enum(['price', 'capacity']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(6),
});

function withoutEmptyValues(query: Request['query']): Record<string, unknown> {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== ''));
}

export const listProducts: RequestHandler = async (req, res) => {
  const parsed = querySchema.safeParse(withoutEmptyValues(req.query));

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new BadRequestError(
      `Invalid query parameter '${issue.path.join('.')}': ${issue.message}`
    );
  }

  res.json(await getProducts(parsed.data));
};
