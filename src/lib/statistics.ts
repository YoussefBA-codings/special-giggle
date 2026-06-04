import type { City } from '../types/city';
import { avg, n } from './formatters';

export interface GlobalStats {
  total: number;
  avgGlobalScore: number;
  avgAptYield: number;
  avgHouseYield: number;
  avgAptPrice: number;
  avgHousePrice: number;
  avgVacancy: number;
  avgIncome: number;
  countCashflow: number;
  countYieldTrap: number;
  countBeginnerFriendly: number;
  countIsolated: number;
  countHighRisk: number;
  countLowRisk: number;
  countPatrimonial: number;
  countHighYield: number;
  countHighYieldSafe: number;
  topGlobalCity: City | null;
  topCashflowCity: City | null;
  topBeginnerCity: City | null;
  topPatrimonialCity: City | null;
  smartSummary: string[];
}

export interface DepartmentStat {
  department: string;
  count: number;
  avgGlobalScore: number;
  avgAptYield: number;
  avgAptPrice: number;
  avgVacancy: number;
  avgIncome: number;
  avgRisk: number;
}

export function computeGlobalStats(cities: City[]): GlobalStats {
  if (cities.length === 0) {
    return {
      total: 0, avgGlobalScore: 0, avgAptYield: 0, avgHouseYield: 0,
      avgAptPrice: 0, avgHousePrice: 0, avgVacancy: 0, avgIncome: 0,
      countCashflow: 0, countYieldTrap: 0, countBeginnerFriendly: 0,
      countIsolated: 0, countHighRisk: 0, countLowRisk: 0,
      countPatrimonial: 0, countHighYield: 0, countHighYieldSafe: 0,
      topGlobalCity: null, topCashflowCity: null,
      topBeginnerCity: null, topPatrimonialCity: null,
      smartSummary: [],
    };
  }

  const countCashflow = cities.filter((c) => c.investment?.profile === 'CASHFLOW_OPPORTUNITY').length;
  const countYieldTrap = cities.filter((c) => c.investment?.profile === 'YIELD_TRAP').length;
  const countBeginnerFriendly = cities.filter((c) => c.investment?.profile === 'BEGINNER_FRIENDLY').length;
  const countIsolated = cities.filter((c) => c.transport?.classification === 'ISOLATED').length;
  const countHighRisk = cities.filter((c) => c.investment?.riskLevel === 'VERY_HIGH' || c.investment?.riskLevel === 'HIGH').length;
  const countLowRisk = cities.filter((c) => c.investment?.riskLevel === 'LOW').length;
  const countPatrimonial = cities.filter((c) => c.investment?.profile === 'PATRIMONIAL_SAFE').length;
  const countHighYield = cities.filter((c) => n(c.prices.apartment.grossYield) > 8).length;
  const countHighYieldSafe = cities.filter(
    (c) => n(c.prices.apartment.grossYield) > 8 && n(c.insee?.vacancyRate) < 8 && n(c.transport?.transportScore) >= 50
  ).length;

  const sorted = [...cities].sort((a, b) => n(b.investment?.globalScore) - n(a.investment?.globalScore));
  const cashflowSorted = [...cities].sort((a, b) => n(b.investment?.cashflowScore) - n(a.investment?.cashflowScore));
  const beginnerSorted = [...cities].sort((a, b) => n(b.investment?.beginnerScore) - n(a.investment?.beginnerScore));
  const patrimonialSorted = [...cities].sort((a, b) => n(b.investment?.patrimonialScore) - n(a.investment?.patrimonialScore));

  const summary: string[] = [];
  summary.push(`Sur ${cities.length} communes analysées, ${countHighYield} affichent un rendement brut supérieur à 8%, mais seulement ${countHighYieldSafe} combinent rendement élevé, vacance maîtrisée et transport correct.`);
  if (countCashflow > 0) summary.push(`${countCashflow} commune${countCashflow > 1 ? 's sont identifiées' : ' est identifiée'} comme opportunité cashflow. ${countYieldTrap} présentent un rendement apparent élevé mais trompeur (pièges).`);
  if (countBeginnerFriendly > 0) summary.push(`${countBeginnerFriendly} commune${countBeginnerFriendly > 1 ? 's sont' : ' est'} recommandée${countBeginnerFriendly > 1 ? 's' : ''} pour un premier investissement.`);
  summary.push(`${countHighRisk} communes présentent un risque élevé ou très élevé — à aborder avec prudence. ${countLowRisk} offrent un profil de risque faible.`);

  return {
    total: cities.length,
    avgGlobalScore: avg(cities.map((c) => c.investment?.globalScore)),
    avgAptYield: avg(cities.map((c) => c.prices.apartment.grossYield)),
    avgHouseYield: avg(cities.map((c) => c.prices.house.grossYield)),
    avgAptPrice: avg(cities.map((c) => c.prices.apartment.average)),
    avgHousePrice: avg(cities.map((c) => c.prices.house.average)),
    avgVacancy: avg(cities.map((c) => c.insee?.vacancyRate)),
    avgIncome: avg(cities.map((c) => c.insee?.medianIncome)),
    countCashflow, countYieldTrap, countBeginnerFriendly,
    countIsolated, countHighRisk, countLowRisk,
    countPatrimonial, countHighYield, countHighYieldSafe,
    topGlobalCity: sorted[0] ?? null,
    topCashflowCity: cashflowSorted[0] ?? null,
    topBeginnerCity: beginnerSorted[0] ?? null,
    topPatrimonialCity: patrimonialSorted[0] ?? null,
    smartSummary: summary,
  };
}

export function computeDepartmentStats(cities: City[]): DepartmentStat[] {
  const map = new Map<string, City[]>();
  cities.forEach((c) => {
    if (!map.has(c.department)) map.set(c.department, []);
    map.get(c.department)!.push(c);
  });

  return Array.from(map.entries())
    .map(([department, dCities]) => ({
      department,
      count: dCities.length,
      avgGlobalScore: avg(dCities.map((c) => c.investment?.globalScore)),
      avgAptYield: avg(dCities.map((c) => c.prices.apartment.grossYield)),
      avgAptPrice: avg(dCities.map((c) => c.prices.apartment.average)),
      avgVacancy: avg(dCities.map((c) => c.insee?.vacancyRate)),
      avgIncome: avg(dCities.map((c) => c.insee?.medianIncome)),
      avgRisk: avg(dCities.map((c) => c.investment?.riskScore)),
    }))
    .sort((a, b) => b.avgGlobalScore - a.avgGlobalScore);
}

export function getAllTags(cities: City[]): string[] {
  const tagSet = new Set<string>();
  cities.forEach((c) => c.insights?.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getDepartments(cities: City[]): string[] {
  return Array.from(new Set(cities.map((c) => c.department))).sort((a, b) => a.localeCompare(b, 'fr'));
}
