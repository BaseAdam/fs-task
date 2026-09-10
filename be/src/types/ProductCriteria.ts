import type { Product } from '../models/product.model.js';

export interface ProductCriteria {
  search?: string;
  capacity?: number;
  energyClass?: Product['energyClass'];
  feature?: string;
}
