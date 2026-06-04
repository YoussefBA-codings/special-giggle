import type { City, CityWithScore, PropertyType } from '../types/city';

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function calculateInvestorScore(
  city: City,
  propertyType: PropertyType,
  allCities: City[],
): number {
  const prop = city.prices[propertyType];
  if (!prop || !prop.average || !prop.grossYield) return 0;

  const yields = allCities.map((c) => c.prices[propertyType].grossYield).filter((v) => v != null && v > 0) as number[];
  const prices = allCities.map((c) => c.prices[propertyType].average).filter((v) => v != null && v > 0) as number[];
  const rents = allCities.map((c) => c.prices[propertyType].rent).filter((v) => v != null && v > 0) as number[];

  const minYield = Math.min(...yields);
  const maxYield = Math.max(...yields);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minRent = Math.min(...rents);
  const maxRent = Math.max(...rents);

  const yieldScore = normalize(prop.grossYield ?? 0, minYield, maxYield);
  // inverted: lower price = higher score
  const priceScore = 1 - normalize(prop.average ?? 0, minPrice, maxPrice);
  const rentScore = normalize(prop.rent ?? 0, minRent, maxRent);

  const score = yieldScore * 0.6 + priceScore * 0.25 + rentScore * 0.15;
  return Math.round(score * 100);
}

export function enrichCities(cities: City[]): CityWithScore[] {
  return cities.map((city) => ({
    ...city,
    scoreApartment: calculateInvestorScore(city, 'apartment', cities),
    scoreHouse: calculateInvestorScore(city, 'house', cities),
  }));
}

export function getYieldBadge(yield_: number | null | undefined): {
  label: string;
  color: string;
  bg: string;
} {
  if (yield_ == null || isNaN(yield_)) return { label: 'N/A', color: '#94a3b8', bg: '#f1f5f9' };
  if (yield_ >= 7) return { label: 'Excellent', color: '#15803d', bg: '#dcfce7' };
  if (yield_ >= 5) return { label: 'Bon', color: '#1d4ed8', bg: '#dbeafe' };
  if (yield_ >= 3) return { label: 'Moyen', color: '#b45309', bg: '#fef3c7' };
  return { label: 'Faible', color: '#b91c1c', bg: '#fee2e2' };
}

export function avg(nums: (number | null | undefined)[]): number {
  const valid = nums.filter((n): n is number => n != null && !isNaN(n) && n > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function formatEur(value: number | null | undefined): string {
  if (value == null || isNaN(value) || value === 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatPct(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—';
  return `${value.toFixed(2)}%`;
}

export function getCityAnalysis(city: City): string {
  const aptYield = city.prices.apartment.grossYield ?? 0;
  const houseYield = city.prices.house.grossYield ?? 0;
  const aptPrice = city.prices.apartment.average ?? 0;
  const housePrice = city.prices.house.average ?? 0;

  const best = aptYield >= houseYield ? 'appartements' : 'maisons';
  const bestYield = Math.max(aptYield, houseYield);
  const bestPrice = aptYield >= houseYield ? aptPrice : housePrice;

  if (bestYield >= 7) {
    return `Opportunité forte sur les ${best} avec ${formatPct(bestYield)} de rendement brut et un prix moyen de ${formatEur(bestPrice)}/m². Ville très intéressante pour l'investissement locatif.`;
  }
  if (bestYield >= 5) {
    return `Rendement correct sur les ${best} (${formatPct(bestYield)}). À ${formatEur(bestPrice)}/m², le ticket d'entrée reste maîtrisé. Ville à considérer dans un portefeuille diversifié.`;
  }
  if (bestYield >= 3) {
    return `Rendement modéré (${formatPct(bestYield)}). Le prix de ${formatEur(bestPrice)}/m² peut limiter la rentabilité. Préférez les biens nécessitant des travaux pour optimiser le retour.`;
  }
  return `Rendement faible (${formatPct(bestYield)}). Marché plutôt orienté résidence principale. L'investissement locatif pur reste difficile à justifier à ${formatEur(bestPrice)}/m².`;
}
