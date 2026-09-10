import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductModel } from '../models/product.model.js';
import { findProducts } from './products.repository.js';

vi.mock('../models/product.model.js', () => ({
  ProductModel: { find: vi.fn(), countDocuments: vi.fn() },
}));

const findMock = vi.mocked(ProductModel.find);

function stubQuery() {
  const query = { sort: vi.fn(), skip: vi.fn(), limit: vi.fn() };

  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);

  return query;
}

let query: ReturnType<typeof stubQuery>;

beforeEach(() => {
  vi.resetAllMocks();
  query = stubQuery();
  findMock.mockReturnValue(query as never);
});

describe('the filter sent to the database', () => {
  it('escapes regular expression characters in the search text', () => {
    findProducts({ search: '.*', skip: 0, limit: 6 });

    expect(findMock).toHaveBeenCalledWith({ code: { $regex: '\\.\\*', $options: 'i' } });
  });

  it('compares a feature against the array without an operator', () => {
    findProducts({ feature: 'Panel AI Control', skip: 0, limit: 6 });

    expect(findMock).toHaveBeenCalledWith({ features: 'Panel AI Control' });
  });

  it('combines every criterion it was given without one overwriting another', () => {
    findProducts({ search: 'WW', capacity: 9, energyClass: 'B', feature: 'X', skip: 0, limit: 6 });

    expect(findMock).toHaveBeenCalledWith({
      code: { $regex: 'WW', $options: 'i' },
      capacity: 9,
      energyClass: 'B',
      features: 'X',
    });
  });
});

describe('the sort order sent to the database', () => {
  it('translates the domain name "price" into the field the document actually uses', () => {
    findProducts({ sort: 'price', skip: 0, limit: 6 });

    expect(query.sort).toHaveBeenCalledWith({ 'price.value': 1, _id: 1 });
  });

  it('always ends on _id so that ties cannot reshuffle between pages', () => {
    findProducts({ skip: 0, limit: 6 });

    expect(query.sort).toHaveBeenCalledWith({ _id: 1 });
  });
});
