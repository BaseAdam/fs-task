import type { QueryFilter, SortOrder } from 'mongoose';

import type { SortField } from '../constants/products.js';
import { ProductModel, type Product } from '../models/product.model.js';
import type { ProductCriteria } from '../types/productCriteria.js';

interface ProductQuery extends ProductCriteria {
  sort?: SortField;
  skip: number;
  limit: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const sortFields: Record<SortField, string> = {
  price: 'price.value',
  capacity: 'capacity',
};

function buildFilter(criteria: ProductCriteria): QueryFilter<Product> {
  const filter: QueryFilter<Product> = {};

  if (criteria.search) {
    filter.code = { $regex: escapeRegex(criteria.search), $options: 'i' };
  }

  if (criteria.capacity !== undefined) {
    filter.capacity = criteria.capacity;
  }

  if (criteria.energyClass) {
    filter.energyClass = criteria.energyClass;
  }

  if (criteria.feature) {
    filter.features = criteria.feature;
  }

  return filter;
}

export function findProducts(query: ProductQuery) {
  const sort: Record<string, SortOrder> = query.sort
    ? { [sortFields[query.sort]]: 1, _id: 1 }
    : { _id: 1 };

  return ProductModel.find(buildFilter(query)).sort(sort).skip(query.skip).limit(query.limit);
}

export function countProducts(criteria: ProductCriteria): Promise<number> {
  return ProductModel.countDocuments(buildFilter(criteria));
}
