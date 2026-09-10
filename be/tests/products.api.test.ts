import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDb, disconnectDb } from '../src/db/connect.js';
import { ProductModel } from '../src/models/product.model.js';
import { products } from '../src/seed/products.js';

const app = createApp();

let container: StartedMongoDBContainer;

beforeAll(async () => {
  container = await new MongoDBContainer('mongo:8').start();

  await connectDb(`${container.getConnectionString()}?directConnection=true`);
  await ProductModel.syncIndexes();
});

beforeEach(async () => {
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(products);
});

afterAll(async () => {
  await disconnectDb();
  await container.stop();
});

type SeedProduct = (typeof products)[number];

const countWhere = (matches: (product: SeedProduct) => boolean) => products.filter(matches).length;

describe('GET /api/products', () => {
  it('returns every product together with its page information', async () => {
    const response = await request(app).get(`/api/products?limit=${products.length}`);

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(products.length);
    expect(response.body.meta).toMatchObject({ total: products.length, page: 1, totalPages: 1 });
  });

  it('leaves the internal _id out of the response', async () => {
    const response = await request(app).get('/api/products?limit=1');

    expect(response.body.products[0]).not.toHaveProperty('_id');
  });

  it('filters by capacity, including a fractional one', async () => {
    const response = await request(app).get('/api/products?capacity=10.5');

    expect(response.body.meta.total).toBe(countWhere((p) => p.capacity === 10.5));
    expect(response.body.products.every((p: { capacity: number }) => p.capacity === 10.5)).toBe(
      true
    );
  });

  it('matches a feature stored inside the array', async () => {
    const feature = 'Drzwi AddWash™';
    const response = await request(app).get(`/api/products?feature=${encodeURIComponent(feature)}`);

    expect(response.body.meta.total).toBe(countWhere((p) => p.features.includes(feature)));
    expect(
      response.body.products.every((p: { features: string[] }) => p.features.includes(feature))
    ).toBe(true);
  });

  it('finds a product by part of its code, ignoring case', async () => {
    const response = await request(app).get('/api/products?search=abt');

    expect(response.body.meta.total).toBe(countWhere((p) => p.code.toLowerCase().includes('abt')));
    expect(
      response.body.products.every((p: { code: string }) => p.code.toLowerCase().includes('abt'))
    ).toBe(true);
  });

  it('treats the search text as literal instead of as a regular expression', async () => {
    const response = await request(app).get(`/api/products?search=${encodeURIComponent('.*')}`);

    expect(response.status).toBe(200);
    expect(response.body.products).toEqual([]);
  });

  it('sorts by price ascending', async () => {
    const response = await request(app).get(`/api/products?sort=price&limit=${products.length}`);

    const prices = response.body.products.map((p: { price: { value: number } }) => p.price.value);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });

  it('pages through the list without repeating or losing a product', async () => {
    const half = Math.ceil(products.length / 2);
    const first = await request(app).get(`/api/products?sort=price&limit=${half}&page=1`);
    const second = await request(app).get(`/api/products?sort=price&limit=${half}&page=2`);

    const codes = [...first.body.products, ...second.body.products].map(
      (p: { code: string }) => p.code
    );

    expect(new Set(codes).size).toBe(products.length);
    expect(first.body.meta.totalPages).toBe(2);
  });

  it('treats a parameter sent with no value as if it were not sent', async () => {
    const response = await request(app).get(
      '/api/products?search=&capacity=&energyClass=&feature=&sort='
    );

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(products.length);
  });
});

describe('rejected requests', () => {
  it('turns a refused query into a 400 in the error envelope', async () => {
    const response = await request(app).get('/api/products?page=abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('answers 404 with the same envelope for an unknown route', async () => {
    const response = await request(app).get('/api/nothing-here');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});

describe('the products collection', () => {
  it('refuses a second product carrying a code that is already taken', async () => {
    await expect(ProductModel.create(products[0])).rejects.toMatchObject({ code: 11000 });
  });
});
