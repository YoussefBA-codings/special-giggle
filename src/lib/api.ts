/// <reference types="vite/client" />
import type {
  CommuneIndex,
  CommuneDetail,
  PaginatedResponse,
  RankingResult,
  RegionSummary,
  RegionDetail,
  DepartmentSummary,
  DepartmentDetail,
} from '../types/api';

export type { CommuneDetail };

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4783';

/** Qualité de données acceptée par défaut dans tous les classements et listings publics. */
export const DEFAULT_QUALITY = 'HIGH';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}) as Record<string, unknown>) as { message?: string };
    throw new Error(err.message ?? `Erreur HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface CitiesParams {
  search?: string;
  department?: string;
  region?: string;
  profile?: string;
  riskLevel?: string;
  dataQuality?: string;
  minGlobalScore?: number;
  maxGlobalScore?: number;
  minYield?: number;
  maxYield?: number;
  minPrice?: number;
  maxPrice?: number;
  minPopulation?: number;
  maxPopulation?: number;
  minRent?: number;
  maxRent?: number;
  minCashflowScore?: number;
  minPatrimonialScore?: number;
  minBeginnerScore?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

function buildCitiesQuery(params: CitiesParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.search) q.set('search', params.search);
  if (params.department) q.set('department', params.department);
  if (params.region) q.set('region', params.region);
  if (params.profile) q.set('profile', params.profile);
  if (params.riskLevel) q.set('riskLevel', params.riskLevel);
  if (params.dataQuality) q.set('dataQuality', params.dataQuality);
  if (params.minGlobalScore != null && params.minGlobalScore > 0) q.set('minGlobalScore', String(params.minGlobalScore));
  if (params.maxGlobalScore != null && params.maxGlobalScore > 0) q.set('maxGlobalScore', String(params.maxGlobalScore));
  if (params.minYield != null && params.minYield > 0) q.set('minYield', String(params.minYield));
  if (params.maxYield != null && params.maxYield > 0) q.set('maxYield', String(params.maxYield));
  if (params.minPrice != null && params.minPrice > 0) q.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null && params.maxPrice > 0) q.set('maxPrice', String(params.maxPrice));
  if (params.minPopulation != null && params.minPopulation > 0) q.set('minPopulation', String(params.minPopulation));
  if (params.maxPopulation != null && params.maxPopulation > 0) q.set('maxPopulation', String(params.maxPopulation));
  if (params.minRent != null && params.minRent > 0) q.set('minRent', String(params.minRent));
  if (params.maxRent != null && params.maxRent > 0) q.set('maxRent', String(params.maxRent));
  if (params.minCashflowScore != null && params.minCashflowScore > 0) q.set('minCashflowScore', String(params.minCashflowScore));
  if (params.minPatrimonialScore != null && params.minPatrimonialScore > 0) q.set('minPatrimonialScore', String(params.minPatrimonialScore));
  if (params.minBeginnerScore != null && params.minBeginnerScore > 0) q.set('minBeginnerScore', String(params.minBeginnerScore));
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  q.set('page', String(params.page ?? 1));
  q.set('limit', String(params.limit ?? 20));
  return q;
}

export function fetchCitiesPage(params: CitiesParams = {}): Promise<PaginatedResponse<CommuneIndex>> {
  return apiFetch(`/cities?${buildCitiesQuery(params)}`);
}

export function fetchCityDetail(inseeCode: string): Promise<CommuneDetail> {
  return apiFetch(`/cities/${inseeCode}`);
}

export function fetchCompareCities(inseeCodes: string[]): Promise<CommuneDetail[]> {
  return apiFetch(`/cities/compare?codes=${inseeCodes.join(',')}`);
}

export function fetchRegions(): Promise<RegionSummary[]> {
  return apiFetch('/regions');
}

export function fetchRegion(slug: string): Promise<RegionDetail> {
  return apiFetch(`/regions/${slug}`);
}

export function fetchRegionCities(slug: string, params: CitiesParams = {}): Promise<PaginatedResponse<CommuneIndex>> {
  return apiFetch(`/regions/${slug}/cities?${buildCitiesQuery(params)}`);
}

export function fetchDepartments(): Promise<DepartmentSummary[]> {
  return apiFetch('/departments');
}

export function fetchDepartment(code: string): Promise<DepartmentDetail> {
  return apiFetch(`/departments/${code}`);
}

export function fetchDepartmentCities(code: string, params: CitiesParams = {}): Promise<PaginatedResponse<CommuneIndex>> {
  return apiFetch(`/departments/${code}/cities?${buildCitiesQuery(params)}`);
}

export function fetchRanking(
  type: string,
  limit = 20,
  opts: { dataQuality?: string } = { dataQuality: DEFAULT_QUALITY },
): Promise<RankingResult> {
  const q = new URLSearchParams({ limit: String(limit) });
  if (opts.dataQuality) q.set('dataQuality', opts.dataQuality);
  return apiFetch(`/rankings/${type}?${q}`);
}

/** Lightweight search for autocomplete — returns at most `limit` cities matching the query. */
export function fetchCitiesSearch(search: string, limit = 8): Promise<CommuneIndex[]> {
  const q = new URLSearchParams({ search, limit: String(limit), page: '1' });
  return apiFetch<PaginatedResponse<CommuneIndex>>(`/cities?${q}`).then((r) => r.data);
}
