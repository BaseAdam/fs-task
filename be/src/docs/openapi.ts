import { z } from 'zod';

import { querySchema } from '../controller/products.controller.js';

function queryParameters() {
  const schema = z.toJSONSchema(querySchema, { io: 'input' });
  const required = new Set(schema.required ?? []);

  return Object.entries(schema.properties ?? {}).map(([name, parameter]) => ({
    name,
    in: 'query',
    required: required.has(name),
    schema: parameter,
  }));
}

const productSchema = {
  type: 'object',
  properties: {
    code: { type: 'string', examples: ['WW90T754ABT'] },
    name: { type: 'string', examples: ['Pralka QuickDrive™'] },
    image: { type: 'string', format: 'uri' },
    color: { type: 'string', examples: ['biała'] },
    capacity: { type: 'number', description: 'In kilograms.', examples: [9] },
    dimensions: {
      type: 'object',
      description: 'Centimetres, matching the "Wymiary(GxSxW)" label on the product card.',
      properties: {
        depth: { type: 'number', examples: [55] },
        width: { type: 'number', examples: [60] },
        height: { type: 'number', examples: [85] },
        unit: { type: 'string', examples: ['cm'] },
      },
    },
    features: { type: 'array', items: { type: 'string' } },
    energyClass: { type: 'string', enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
    price: {
      type: 'object',
      properties: {
        value: { type: 'number', examples: [2999.1] },
        currency: { type: 'string', examples: ['zł'] },
        installment: {
          type: 'object',
          properties: {
            value: { type: 'number', examples: [53.31] },
            period: { type: 'integer', description: 'Number of instalments.', examples: [60] },
          },
        },
        validFrom: { type: 'string', format: 'date-time' },
        validTo: { type: 'string', format: 'date-time' },
      },
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const metaSchema = {
  type: 'object',
  properties: {
    total: { type: 'integer', description: 'Products matching the filters, ignoring paging.' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string', examples: ['BAD_REQUEST'] },
        message: { type: 'string' },
      },
    },
  },
};

const json = (schema: object) => ({ content: { 'application/json': { schema } } });

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Products API',
    version: '1.0.0',
    description:
      'Read-only API behind the product listing. Query parameters are documented straight from the schema that validates them.',
  },
  paths: {
    '/api/products': {
      get: {
        summary: 'List products',
        description:
          'Every parameter is optional. A parameter sent with no value counts as absent, because the frontend uses an empty string to mean "no filter".',
        parameters: queryParameters(),
        responses: {
          200: {
            description: 'A page of products and the information needed to ask for the next one.',
            ...json({
              type: 'object',
              properties: {
                products: { type: 'array', items: productSchema },
                meta: metaSchema,
              },
            }),
          },
          400: {
            description: 'A query parameter was the wrong type or outside its allowed range.',
            ...json(errorSchema),
          },
        },
      },
    },
    '/api/health-check': {
      get: {
        summary: 'Report whether the API can reach the database',
        responses: {
          200: {
            description: 'The database is reachable.',
            ...json({
              type: 'object',
              properties: {
                status: { type: 'string', examples: ['ok'] },
                db: { type: 'string', examples: ['connected'] },
              },
            }),
          },
          503: {
            description: 'The API is up but the database is not reachable.',
            ...json({
              type: 'object',
              properties: {
                status: { type: 'string', examples: ['degraded'] },
                db: { type: 'string', examples: ['disconnected'] },
              },
            }),
          },
        },
      },
    },
  },
};
