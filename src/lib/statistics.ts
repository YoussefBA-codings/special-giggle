import type { CommuneIndex, DepartmentListItem } from '../types/api';
import { avg } from './formatters';

// Stats computed from API data (department aggregates + ranking counts)
export interface DashboardStats {
  total: number;
  avgGlobalScore: number;
  avgAptYield: number | null;
  avgHouseYield: number | null;
  avgAptPrice: number | null;
  avgHousePrice: number | null;
  countCashflow: number;
  countYieldTrap: number;
  countBeginnerFriendly: number;
  countHighRisk: number;
  countLowRisk: number;
  countPatrimonial: number;
  countHighYield: number;
  topGlobalCity: CommuneIndex | null;
  topCashflowCity: CommuneIndex | null;
  topBeginnerCity: CommuneIndex | null;
  topPatrimonialCity: CommuneIndex | null;
  smartSummary: string[];
}

export function buildDashboardStats(partial: Omit<DashboardStats, 'smartSummary'>): DashboardStats {
  const {
    total, countCashflow, countYieldTrap, countBeginnerFriendly,
    countHighRisk, countLowRisk, countHighYield,
    avgAptYield,
  } = partial;

  const summary: string[] = [];
  summary.push(
    `Sur ${total.toLocaleString('fr-FR')} communes analysées, ${countHighYield} affichent un rendement brut supérieur à 8%.`
  );
  if (countCashflow > 0) {
    summary.push(
      `${countCashflow} commune${countCashflow > 1 ? 's sont identifiées' : ' est identifiée'} comme opportunité cashflow (HIGH_YIELD). ${countYieldTrap} présentent un rendement trompeur.`
    );
  }
  if (countBeginnerFriendly > 0) {
    summary.push(
      `${countBeginnerFriendly} commune${countBeginnerFriendly > 1 ? 's sont recommandées' : ' est recommandée'} pour un premier investissement.`
    );
  }
  if (avgAptYield != null) {
    summary.push(
      `Rendement moyen appartement : ${avgAptYield.toFixed(1)}%. ${countHighRisk} communes présentent un risque élevé — ${countLowRisk} offrent un risque faible.`
    );
  }

  return { ...partial, smartSummary: summary };
}

// Department stats shape matching the API /departments endpoint
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

export function departmentListItemToStat(d: DepartmentListItem): DepartmentStat {
  return {
    department: d.code,
    count: d.communesCount,
    avgGlobalScore: d.avgGlobalScore,
    avgAptYield: d.avgApartmentYield ?? 0,
    avgAptPrice: d.avgApartmentPrice ?? 0,
    avgVacancy: 0,
    avgIncome: 0,
    avgRisk: 0,
  };
}

export function avgFromDepartments(
  depts: DepartmentListItem[],
  getter: (d: DepartmentListItem) => number | null
): number | null {
  const values = depts.map(getter).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return avg(values);
}
