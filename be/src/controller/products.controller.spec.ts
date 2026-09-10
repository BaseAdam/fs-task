import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BadRequestError } from '../errors/appError.js';
import { getProducts } from '../service/products.service.js';
import { listProducts } from './products.controller.js';

vi.mock('../service/products.service.js', () => ({ getProducts: vi.fn() }));

const getProductsMock = vi.mocked(getProducts);

function handle(query: Record<string, unknown>) {
  const req = { query } as unknown as Request;
  const json = vi.fn();
  const res = { json } as unknown as Response;

  return { finished: Promise.resolve(listProducts(req, res, vi.fn())), json };
}

beforeEach(() => {
  vi.resetAllMocks();
  getProductsMock.mockResolvedValue({
    products: [],
    meta: { total: 0, page: 1, limit: 6, totalPages: 0 },
  });
});

describe('listProducts', () => {
  it('reads a query string of text into typed values, filling in the defaults', async () => {
    const { finished } = handle({ capacity: '10.5', page: '2', energyClass: 'A' });
    await finished;

    expect(getProductsMock).toHaveBeenCalledWith({
      capacity: 10.5,
      page: 2,
      energyClass: 'A',
      limit: 6,
    });
  });

  it('drops parameters that arrive with no value', async () => {
    const { finished } = handle({ search: '', capacity: '', energyClass: '', sort: '' });
    await finished;

    expect(getProductsMock).toHaveBeenCalledWith({ page: 1, limit: 6 });
  });

  it('answers with whatever the service returned', async () => {
    const answer = { products: [], meta: { total: 3, page: 1, limit: 6, totalPages: 1 } };
    getProductsMock.mockResolvedValue(answer);

    const { finished, json } = handle({});
    await finished;

    expect(json).toHaveBeenCalledWith(answer);
  });

  it.each([
    { label: 'a value that is not a number', query: { page: 'abc' } },
    { label: 'a value outside the allowed range', query: { limit: '999' } },
    { label: 'a value outside the allowed set', query: { sort: 'name' } },
  ])('refuses $label without troubling the service', async ({ query }) => {
    const { finished } = handle(query);

    await expect(finished).rejects.toBeInstanceOf(BadRequestError);
    expect(getProductsMock).not.toHaveBeenCalled();
  });

  it('names the offending parameter, so the message is of some use', async () => {
    const { finished } = handle({ sort: 'name' });

    await expect(finished).rejects.toThrow(/sort/);
  });
});
