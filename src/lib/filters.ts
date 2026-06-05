import type { Filters } from '../types/filters';
import type { CitiesParams } from './api';

export function filtersToApiParams(filters: Filters): CitiesParams {
  const params: CitiesParams = {
    sortBy: filters.sortBy || 'globalScore',
    sortOrder: filters.sortOrder || 'desc',
  };
  if (filters.search) params.search = filters.search;
  if (filters.department) params.department = filters.department;
  if (filters.profile) params.profile = filters.profile;
  if (filters.riskLevel) params.riskLevel = filters.riskLevel;
  if (filters.minYield > 0) params.minYield = filters.minYield;
  if (filters.maxYield > 0) params.maxYield = filters.maxYield;
  if (filters.maxPrice > 0) params.maxPrice = filters.maxPrice;
  if (filters.minGlobalScore > 0) params.minGlobalScore = filters.minGlobalScore;
  return params;
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search !== '' ||
    filters.department !== '' ||
    filters.profile !== '' ||
    filters.riskLevel !== '' ||
    filters.minYield > 0 ||
    filters.maxYield > 0 ||
    filters.maxPrice > 0 ||
    filters.minGlobalScore > 0
  );
}
