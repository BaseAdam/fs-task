export type EnergyClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// capacity values can be modified depends on items in DB
// when a new product appears with new capacity we don't need to add values here
export type Capacity = number;

// similar case to Capacity
export type Features = string;

interface Dimensions {
  depth: number;
  width: number;
  height: number;
  unit: string;
}

export interface IProduct {
  image: string;
  code: string;
  name: string;
  color: string;
  capacity: Capacity;
  dimensions: Dimensions;
  features: Features[];
  energyClass: EnergyClass;
  price: {
    value: number;
    currency: string;
    installment: {
      value: number;
      period: number;
    };
    validFrom: Date;
    validTo: Date;
  };
}

export interface ProductsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
