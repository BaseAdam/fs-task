import { IProduct, ProductsMeta } from '../interfaces/product';
import { buildQueryString } from '../utils/buildQueryString';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

type ProductsQuery = {
  search?: string;
  capacity?: number | '';
  energyClass?: string;
  feature?: string;
  sort?: string;
  page?: number;
};

interface ProductsResponse {
  products: IProduct[];
  meta: ProductsMeta;
}

interface ProductDto extends Omit<IProduct, 'price'> {
  price: {
    value: number;
    currency: string;
    installment: {
      value: number;
      period: number;
    };
    validFrom: string;
    validTo: string;
  };
}

// converts strings from API to Date
function toProduct(dto: ProductDto): IProduct {
  return {
    ...dto,
    price: {
      ...dto.price,
      validFrom: new Date(dto.price.validFrom),
      validTo: new Date(dto.price.validTo),
    },
  };
}

export async function fetchProducts(
  query: ProductsQuery,
  signal?: AbortSignal
): Promise<ProductsResponse> {
  const response = await fetch(`${API_URL}/api/products?${buildQueryString(query)}`, { signal });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? `Request failed with status ${response.status}`);
  }

  const data: { products: ProductDto[]; meta: ProductsMeta } = await response.json();

  return {
    products: data.products.map(toProduct),
    meta: data.meta,
  };
}
