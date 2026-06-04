import { useMemo } from 'react';
import type { City } from '../types/city';
import { computeDepartmentStats } from '../lib/statistics';
import { ScatterYieldRisk } from '../components/charts/ScatterYieldRisk';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';

interface Props {
  cities: City[];
  onCityClick: (city: City) => void;
}

export function RiskMapPage({ cities, onCityClick }: Props) {
  const deptStats = useMemo(() => computeDepartmentStats(cities), [cities]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-100 mb-1">Risk Map</h2>
        <p className="text-sm text-slate-500">
          Visualisations multi-dimensionnelles — cliquez sur un point pour ouvrir la fiche ville
        </p>
      </div>

      {/* Scatter grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ScatterYieldRisk
          cities={cities}
          onCityClick={onCityClick}
          xKey="yield"
          yKey="risk"
          title="Rendement vs Risque (appartements)"
        />
        <ScatterYieldRisk
          cities={cities}
          onCityClick={onCityClick}
          xKey="yield"
          yKey="transport"
          title="Rendement vs Score transport"
        />
        <ScatterYieldRisk
          cities={cities}
          onCityClick={onCityClick}
          xKey="price"
          yKey="yield"
          title="Prix m² vs Rendement"
        />
        <ScatterYieldRisk
          cities={cities}
          onCityClick={onCityClick}
          xKey="vacancy"
          yKey="yield"
          title="Vacance vs Rendement"
        />
      </div>

      {/* Department charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DepartmentBarChart
          data={deptStats}
          metric="avgAptPrice"
          title="Prix moyen appartement par département (€/m²)"
          unit="€"
        />
        <DepartmentBarChart
          data={deptStats}
          metric="avgVacancy"
          title="Vacance moyenne par département (%)"
          unit="%"
          colorFn={(v) => v > 12 ? '#ef4444' : v > 8 ? '#f97316' : v > 5 ? '#f59e0b' : '#10b981'}
        />
        <DepartmentBarChart
          data={deptStats}
          metric="avgIncome"
          title="Revenu médian moyen par département (€)"
          unit="€"
        />
        <DepartmentBarChart
          data={deptStats}
          metric="avgRisk"
          title="Score de risque moyen par département"
          colorFn={(v) => v > 70 ? '#ef4444' : v > 50 ? '#f97316' : v > 35 ? '#f59e0b' : '#10b981'}
        />
      </div>
    </div>
  );
}
