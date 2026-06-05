import { useEffect, useState } from 'react';
import type { CommuneIndex, DepartmentListItem } from '../types/api';
import { fetchCitiesPage, fetchRanking, fetchDepartments } from '../lib/api';
import { buildDashboardStats, departmentListItemToStat, type DashboardStats, type DepartmentStat } from '../lib/statistics';
import { n } from '../lib/formatters';
import { HeroStats } from '../components/dashboard/HeroStats';
import { SmartSummary } from '../components/dashboard/SmartSummary';
import { OpportunitySection } from '../components/opportunities/OpportunitySection';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';
import { DistributionChart } from '../components/charts/DistributionChart';

interface Props {
  onCityClick: (inseeCode: string) => void;
  onNavigate: (page: string) => void;
}

const EMPTY_STATS: DashboardStats = {
  total: 0, avgGlobalScore: 0, avgAptYield: null, avgHouseYield: null,
  avgAptPrice: null, avgHousePrice: null,
  countCashflow: 0, countYieldTrap: 0, countBeginnerFriendly: 0,
  countHighRisk: 0, countLowRisk: 0, countPatrimonial: 0, countHighYield: 0,
  topGlobalCity: null, topCashflowCity: null, topBeginnerCity: null, topPatrimonialCity: null,
  smartSummary: [],
};

export function DashboardPage({ onCityClick, onNavigate }: Props) {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [topGlobal, setTopGlobal] = useState<CommuneIndex[]>([]);
  const [topCashflow, setTopCashflow] = useState<CommuneIndex[]>([]);
  const [distributionSample, setDistributionSample] = useState<CommuneIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchRanking('global', 10),
      fetchRanking('cashflow', 10),
      fetchDepartments(),
      // Count calls per profile/risk (limit=1, only meta.total matters)
      fetchCitiesPage({ profile: 'HIGH_YIELD', limit: 1 }),
      fetchCitiesPage({ profile: 'YIELD_TRAP', limit: 1 }),
      fetchCitiesPage({ profile: 'BEGINNER_FRIENDLY', limit: 1 }),
      fetchCitiesPage({ riskLevel: 'HIGH', limit: 1 }),
      fetchCitiesPage({ riskLevel: 'LOW', limit: 1 }),
      fetchCitiesPage({ profile: 'PATRIMONIAL', limit: 1 }),
      fetchCitiesPage({ minYield: 8, limit: 1 }),
      fetchCitiesPage({ limit: 1 }),
      // Distribution sample
      fetchRanking('global', 200),
    ])
      .then(([globalRanking, cashflowRanking, depts, cashflowCount, trapCount, beginnerCount, highRiskCount, lowRiskCount, patrimonialCount, highYieldCount, totalCount, distRanking]) => {
        const departments = depts as DepartmentListItem[];
        const dStats = departments.map(departmentListItemToStat);
        setDeptStats(dStats);

        const globalCities = (globalRanking as { communes: CommuneIndex[] }).communes;
        const cashflowCities = (cashflowRanking as { communes: CommuneIndex[] }).communes;
        setTopGlobal(globalCities);
        setTopCashflow(cashflowCities);
        setDistributionSample((distRanking as { communes: CommuneIndex[] }).communes);

        const avgGlobalScore = dStats.length > 0
          ? dStats.reduce((a, d) => a + d.avgGlobalScore, 0) / dStats.length : 0;
        const avgAptYield = departments.length > 0
          ? (() => { const vals = departments.map(d => d.avgApartmentYield).filter((v): v is number => v != null); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; })()
          : null;
        const avgAptPrice = departments.length > 0
          ? (() => { const vals = departments.map(d => d.avgApartmentPrice).filter((v): v is number => v != null); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null; })()
          : null;

        const partial = {
          total: (totalCount as { meta: { total: number } }).meta.total,
          avgGlobalScore,
          avgAptYield,
          avgHouseYield: null,
          avgAptPrice,
          avgHousePrice: null,
          countCashflow: (cashflowCount as { meta: { total: number } }).meta.total,
          countYieldTrap: (trapCount as { meta: { total: number } }).meta.total,
          countBeginnerFriendly: (beginnerCount as { meta: { total: number } }).meta.total,
          countHighRisk: (highRiskCount as { meta: { total: number } }).meta.total,
          countLowRisk: (lowRiskCount as { meta: { total: number } }).meta.total,
          countPatrimonial: (patrimonialCount as { meta: { total: number } }).meta.total,
          countHighYield: (highYieldCount as { meta: { total: number } }).meta.total,
          topGlobalCity: globalCities[0] ?? null,
          topCashflowCity: cashflowCities[0] ?? null,
          topBeginnerCity: null,
          topPatrimonialCity: null,
        };

        setStats(buildDashboardStats(partial));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-48 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <HeroStats stats={stats} onNavigate={onNavigate} />
      <SmartSummary stats={stats} />
      <OpportunitySection
        title="Top 10 — Score global" subtitle="Meilleures communes toutes stratégies" emoji="🌟"
        cities={topGlobal.slice(0, 10)} scoreGetter={(c) => n(c.globalScore)}
        onCityClick={onCityClick} defaultExpanded maxVisible={6}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DepartmentBarChart data={deptStats.slice(0, 12)} metric="avgGlobalScore" title="Score moyen par département" isDark={isDark} />
        <DepartmentBarChart data={deptStats.slice(0, 12)} metric="avgAptYield"    title="Rendement moyen par département (%)" unit="%" isDark={isDark} colorFn={(v) => v >= 7 ? '#10b981' : v >= 5 ? '#3b82f6' : v >= 3 ? '#f59e0b' : '#ef4444'} />
      </div>
      <DistributionChart cities={distributionSample} isDark={isDark} />
      <OpportunitySection
        title="Top 10 — Cashflow" subtitle="Meilleur rendement locatif" emoji="💰"
        cities={topCashflow.slice(0, 10)} scoreGetter={(c) => n(c.cashflowScore)}
        onCityClick={onCityClick} maxVisible={6}
      />
    </div>
  );
}
