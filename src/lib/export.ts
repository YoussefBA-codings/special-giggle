import type { City } from '../types/city';
import { n, fmt } from './formatters';

export function exportToCSV(cities: City[], filename = 'immoinsight-export.csv'): void {
  const headers = [
    'Ville', 'Département', 'Code postal',
    'Score global', 'Profil', 'Recommandation', 'Niveau risque',
    'Meilleur bien',
    'Prix moyen appt (€/m²)', 'Loyer appt (€/m²)', 'Rendement appt (%)',
    'Prix moyen maison (€/m²)', 'Loyer maison (€/m²)', 'Rendement maison (%)',
    'Score cashflow', 'Score débutant', 'Score patrimonial', 'Score long terme',
    'Vacance (%)', 'Croissance pop. 6 ans (%)',
    'Revenu médian (€)', 'Population',
    'Score transport', 'Classification transport',
    'Gare la plus proche', 'Distance gare (km)',
    'Tags',
  ];

  const rows = cities.map((c) => [
    c.city,
    c.department,
    c.postalCode,
    n(c.investment?.globalScore),
    c.investment?.profile ?? '',
    c.investment?.recommendation ?? '',
    c.investment?.riskLevel ?? '',
    c.investment?.bestPropertyType ?? '',
    n(c.prices.apartment.average),
    n(c.prices.apartment.rent),
    n(c.prices.apartment.grossYield),
    n(c.prices.house.average),
    n(c.prices.house.rent),
    n(c.prices.house.grossYield),
    n(c.investment?.cashflowScore),
    n(c.investment?.beginnerScore),
    n(c.investment?.patrimonialScore),
    n(c.investment?.longTermScore),
    n(c.insee?.vacancyRate),
    n(c.insee?.populationGrowth6Y),
    n(c.insee?.medianIncome),
    n(c.insee?.population),
    n(c.transport?.transportScore),
    c.transport?.classification ?? '',
    c.transport?.nearestStation?.name ?? '',
    n(c.transport?.nearestStation?.distanceKm),
    (c.insights?.tags ?? []).join(', '),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Silence unused fmt import warning
void fmt;
