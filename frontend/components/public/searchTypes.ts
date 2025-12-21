export interface SearchFilters {
  search?: string;
  keyword?: string;
  make?: string;
  model?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  minMileage?: string;
  maxMileage?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  steering?: string;
  stockCountry?: string;
}
