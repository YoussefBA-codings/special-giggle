import type { CommuneIndex } from '../types/api';

export function exportToCSV(cities: CommuneIndex[], filename = 'immoinsight-export.csv'): void {
  const headers = [
    'Ville', 'Département', 'Code postal', 'Code INSEE',
    'Région', 'Population',
    'Score global', 'Score cashflow', 'Score rendement', 'Score débutant',
    'Score patrimonial', 'Score long terme', 'Score demande locative',
    'Profil', 'Niveau risque',
    'Prix moyen appt (€/m²)', 'Loyer appt (€/m²)', 'Rendement appt (%)',
    'Prix moyen maison (€/m²)', 'Loyer maison (€/m²)', 'Rendement maison (%)',
    'Tags',
  ];

  const rows = cities.map((c) => [
    c.city,
    c.department,
    c.postalCode,
    c.inseeCode,
    c.regionSlug,
    c.population ?? '',
    c.globalScore ?? '',
    c.cashflowScore ?? '',
    c.yieldScore ?? '',
    c.beginnerScore ?? '',
    c.patrimonialScore ?? '',
    c.longTermScore ?? '',
    c.rentalDemandScore ?? '',
    c.profile ?? '',
    c.riskLevel ?? '',
    c.apartmentPrice ?? '',
    c.apartmentRent ?? '',
    c.apartmentYield ?? '',
    c.housePrice ?? '',
    c.houseRent ?? '',
    c.houseYield ?? '',
    (c.tags ?? []).join(', '),
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
