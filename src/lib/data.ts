import type { City } from '../types/city';

export async function fetchCities(): Promise<City[]> {
  const res = await fetch('/data/cities.json');
  if (!res.ok) throw new Error(`Impossible de charger cities.json (${res.status})`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new Error('Format de données invalide');
  return data as City[];
}

export function getDepartments(cities: City[]): string[] {
  const deps = new Set(cities.map((c) => c.department));
  return Array.from(deps).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function exportToCSV(cities: City[]): void {
  const headers = [
    'Ville', 'Département', 'Code postal',
    'Prix m² appt', 'Loyer appt', 'Rendement appt %',
    'Prix m² maison', 'Loyer maison', 'Rendement maison %',
  ];

  const rows = cities.map((c) => [
    c.city,
    c.department,
    c.postalCode,
    c.prices.apartment.average,
    c.prices.apartment.rent,
    c.prices.apartment.grossYield,
    c.prices.house.average,
    c.prices.house.rent,
    c.prices.house.grossYield,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(';'))
    .join('\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'villes-idf-rentabilite.csv';
  link.click();
  URL.revokeObjectURL(url);
}
