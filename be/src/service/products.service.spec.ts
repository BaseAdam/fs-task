import { beforeEach, describe, expect, it, vi } from 'vitest';

import { countProducts, findProducts } from '../repository/products.repository.js';
import { getProducts } from './products.service.js';

vi.mock('../repository/products.repository.js', () => ({
  findProducts: vi.fn(),
  countProducts: vi.fn(),
}));

const findProductsMock = vi.mocked(findProducts);
const countProductsMock = vi.mocked(countProducts);

beforeEach(() => {
  vi.resetAllMocks();
  findProductsMock.mockResolvedValue([]);
  countProductsMock.mockResolvedValue(0);
});

describe('getProducts', () => {
  it.each([
    { page: 1, limit: 6, skip: 0 },
    { page: 3, limit: 6, skip: 12 },
    { page: 2, limit: 3, skip: 3 },
  ])('turns page $page of $limit into skipping $skip documents', async ({ page, limit, skip }) => {
    await getProducts({ page, limit });

    expect(findProductsMock).toHaveBeenCalledWith(expect.objectContaining({ skip, limit }));
  });

  it('counts every match, ignoring the current page', async () => {
    await getProducts({ page: 2, limit: 6, sort: 'price', capacity: 9 });

    expect(countProductsMock).toHaveBeenCalledWith({ capacity: 9 });
  });

  it.each([
    { total: 7, limit: 6, totalPages: 2 },
    { total: 6, limit: 6, totalPages: 1 },
    { total: 0, limit: 6, totalPages: 0 },
  ])('reports $totalPages pages for $total products', async ({ total, limit, totalPages }) => {
    countProductsMock.mockResolvedValue(total);

    const result = await getProducts({ page: 1, limit });

    expect(result.meta).toEqual({ total, page: 1, limit, totalPages });
  });

  it('hands back whatever the repository found, untouched', async () => {
    const found: Awaited<ReturnType<typeof findProducts>> = [];
    findProductsMock.mockResolvedValue(found);

    const result = await getProducts({ page: 1, limit: 6 });

    expect(result.products).toBe(found);
  });
});
