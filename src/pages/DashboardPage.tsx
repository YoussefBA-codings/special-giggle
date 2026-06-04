import { useMemo } from 'react';
import type { City } from '../types/city';
import type { Page } from '../components/layout/Sidebar';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { computeGlobalStats, computeDepartmentStats } from '../lib/statistics';
import { getRankings } from '../lib/rankings';
import { n } from '../lib/formatters';
import { HeroStats } from '../components/dashboard/HeroStats';
import { SmartSummary } from '../components/dashboard/SmartSummary';
import { OpportunitySection } from '../components/opportunities/OpportunitySection';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';
import { DistributionChart } from '../components/charts/DistributionChart';

interface Props {
  cities: City[];
  onCityClick: (city: City) => void;
  onNavigate: (page: Page | string) => void;
}

export function DashboardPage({ cities, onCityClick, onNavigate }: Props) {
  const stats = useMemo(() => computeGlobalStats(cities), [cities]);
  const deptStats = useMemo(() => computeDepartmentStats(cities), [cities]);
  const rankings = useMemo(() => getRankings(cities), [cities]);

  return (
    <div className="space-y-6 p-6">
      {/* Hero KPIs */}
      <HeroStats stats={stats} onNavigate={onNavigate} />

      {/* Smart summary */}
      <SmartSummary stats={stats} />

      {/* Top global quick access */}
      <OpportunitySection
        title="Top 10 — Score global"
        subtitle="Les meilleures communes toutes stratégies confondues"
        emoji="🌟"
        cities={rankings.topGlobal.slice(0, 10)}
        
        scoreGetter={(c) => n(c.investment?.globalScore)}
        onCityClick={onCityClick}
        defaultExpanded
        maxVisible={6}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DepartmentBarChart
          data={deptStats.slice(0, 12)}
          metric="avgGlobalScore"
          title="Score moyen par département"
        />
        <DepartmentBarChart
          data={deptStats.slice(0, 12)}
          metric="avgAptYield"
          title="Rendement moyen par département (%)"
          unit="%"
          colorFn={(v) => v >= 7 ? '#10b981' : v >= 5 ? '#3b82f6' : v >= 3 ? '#f59e0b' : '#ef4444'}
        />
      </div>

      {/* Distribution */}
      <DistributionChart cities={cities} />

      {/* Top cashflow */}
      <OpportunitySection
        title="Top 10 — Cashflow"
        subtitle="Meilleur rendement locatif hors pièges"
        emoji="💰"
        cities={rankings.topCashflow.slice(0, 10)}
        
        scoreGetter={(c) => n(c.investment?.cashflowScore)}
        onCityClick={onCityClick}
        maxVisible={6}
      />
    </div>
  );
}
