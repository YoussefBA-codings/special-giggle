import type { City } from '../types/city';

export async function fetchCities(): Promise<City[]> {
  const res = await fetch('/data/cities.final.json');
  if (!res.ok) throw new Error(`Impossible de charger cities.final.json (HTTP ${res.status})`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Format de données invalide : tableau attendu');
  return data as City[];
}
