export interface PropertyStats {
  average: number | null;
  min: number | null;
  max: number | null;
  rent: number | null;
  grossYield: number | null;
}

export interface AllStats {
  rent: number | null;
}

export interface CityPrices {
  apartment: PropertyStats;
  house: PropertyStats;
  all: AllStats;
}

export interface City {
  city: string;
  postalCode: string;
  department: string;
  url: string;
  prices: CityPrices;
}

export type PropertyType = 'apartment' | 'house';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface Filters {
  search: string;
  department: string;
  propertyType: PropertyType | 'all';
  minYield: number;
  maxPrice: number;
  minRent: number;
}

export interface CityWithScore extends City {
  scoreApartment: number;
  scoreHouse: number;
}
