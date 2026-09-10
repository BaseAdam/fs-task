import { ProductCriteria } from '../types/ProductCriteria.js';
import { countProducts, findProducts } from '../repository/products.repository.js';

interface GetProductsParams extends ProductCriteria {
  sort?: 'price' | 'capacity';
  page: number;
  limit: number;
}

export async function getProducts(params: GetProductsParams) {
  const { page, limit, sort, ...criteria } = params;
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    findProducts({ ...criteria, sort, skip, limit }),
    countProducts(criteria),
  ]);

  return {
    products: data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
