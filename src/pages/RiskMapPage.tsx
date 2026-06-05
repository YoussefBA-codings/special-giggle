import { useEffect, useState } from 'react';
import type { CommuneIndex, DepartmentListItem } from '../types/api';
import { fetchCitiesPage, fetchDepartments, DEFAULT_QUALITY } from '../lib/api';
import { departmentListItemToStat, type DepartmentStat } from '../lib/statistics';
import { ScatterYieldRisk } from '../components/charts/ScatterYieldRisk';
import { DepartmentBarChart } from '../components/charts/DepartmentBarChart';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '../router';

interface Props { onCityClick?: (inseeCode: string) => void; }

type XKey = 'yield' | 'price' | 'cashflow' | 'beginner';
type YKey = 'risk' | 'globalScore' | 'yieldScore' | 'patrimonial';

const X_OPTIONS: { value: XKey; label: string }[] = [
  { value: 'yield', label: 'Rendement brut (%)' },
  { value: 'price', label: 'Prix m² (€)' },
  { value: 'cashflow', label: 'Score cashflow' },
  { value: 'beginner', label: 'Score débutant' },
];

const Y_OPTIONS: { value: YKey; label: string }[] = [
  { value: 'risk', label: 'Score risque' },
  { value: 'globalScore', label: 'Score global' },
  { value: 'yieldScore', label: 'Score rendement' },
  { value: 'patrimonial', label: 'Score patrimonial' },
];

export function RiskMapPage({ onCityClick }: Props) {
  const navigate = useNavigate();
  const handleCityClick = onCityClick ?? ((id: string) => navigate(`/cities/${id}`));
  const [cities, setCities] = useState<CommuneIndex[]>([]);
  const [deptStats, setDeptStats] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [xKey, setXKey] = useState<XKey>('yield');
  const [yKey, setYKey] = useState<YKey>('risk');
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchCitiesPage({ limit: 200, sortBy: 'globalScore', sortOrder: 'desc', dataQuality: DEFAULT_QUALITY }),
      fetchDepartments(),
    ])
      .then(([citiesRes, depts]) => {
        setCities(citiesRes.data);
        setDeptStats((depts as DepartmentListItem[]).map(departmentListItemToStat));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin t-muted" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-black t-primary mb-1">Carte risque / rendement</h2>
        <p className="text-sm t-muted">Visualisez les {cities.length} communes par profil de risque et rendement</p>
      </div>

      {/* Scatter controls */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="label-xs block mb-1">Axe X</label>
            <select value={xKey} onChange={(e) => setXKey(e.target.value as XKey)} className="input-base">
              {X_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-xs block mb-1">Axe Y</label>
            <select value={yKey} onChange={(e) => setYKey(e.target.value as YKey)} className="input-base">
              {Y_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <ScatterYieldRisk cities={cities} xKey={xKey} yKey={yKey} onCityClick={handleCityClick} isDark={isDark} />
      </div>

      {/* Department bars */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DepartmentBarChart
          data={deptStats.slice(0, 15)} metric="avgGlobalScore"
          title="Score moyen par département" isDark={isDark}
        />
        <DepartmentBarChart
          data={deptStats.slice(0, 15)} metric="avgAptYield"
          title="Rendement moyen par département (%)" unit="%" isDark={isDark}
          colorFn={(v) => v >= 7 ? '#10b981' : v >= 5 ? '#3b82f6' : v >= 3 ? '#f59e0b' : '#ef4444'}
        />
      </div>

      {/* Risk distribution summary */}
      <div className="card p-4">
        <h3 className="label-xs mb-3">Distribution par niveau de risque</h3>
        <div className="grid grid-cols-3 gap-3">
          {(['LOW', 'MEDIUM', 'HIGH'] as const).map((risk) => {
            const count = cities.filter((c) => c.riskLevel === risk).length;
            const pct = cities.length > 0 ? Math.round((count / cities.length) * 100) : 0;
            const styles = {
              LOW: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-400', label: 'Faible' },
              MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-700 dark:text-amber-400', label: 'Modéré' },
              HIGH: { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-900', text: 'text-red-700 dark:text-red-400', label: 'Élevé' },
            }[risk];
            return (
              <div key={risk} className={`rounded-xl border p-3 ${styles.bg} ${styles.border}`}>
                <p className={`text-xs font-semibold ${styles.text}`}>{styles.label}</p>
                <p className={`text-2xl font-black mt-1 ${styles.text}`}>{count}</p>
                <p className="text-[10px] t-muted">{pct}% du top 200</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
