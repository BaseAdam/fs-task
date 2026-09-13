import type { Request, RequestHandler } from 'express';
import { z } from 'zod';

import { ENERGY_CLASSES, SORT_FIELDS } from '../constants/products.js';
import { BadRequestError } from '../errors/appError.js';
import { getProducts } from '../service/products.service.js';

export const querySchema = z.object({
  search: z.string().trim().min(1).optional(),
  capacity: z.coerce.number().positive().optional(),
  energyClass: z.enum(ENERGY_CLASSES).optional(),
  feature: z.string().trim().min(1).optional(),
  sort: z.enum(SORT_FIELDS).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(6),
});

const isBlank = (value: unknown) => typeof value === 'string' && value.trim() === '';

function withoutEmptyValues(query: Request['query']): Record<string, unknown> {
  return Object.fromEntries(Object.entries(query).filter(([, value]) => !isBlank(value)));
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
