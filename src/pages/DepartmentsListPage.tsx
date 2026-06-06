import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { fetchDepartments } from '../lib/api';
import type { DepartmentSummary } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg } from '../lib/insights';
import { useNavigate } from '../router';

const REGIONS_META: Record<string, string> = {
  'ile-de-france': 'Île-de-France', 'auvergne-rhone-alpes': 'Auvergne-Rhône-Alpes',
  'provence-alpes-cote-d-azur': 'PACA', 'occitanie': 'Occitanie', 'nouvelle-aquitaine': 'Nouvelle-Aquitaine',
  'hauts-de-france': 'Hauts-de-France', 'grand-est': 'Grand Est', 'bretagne': 'Bretagne',
  'pays-de-la-loire': 'Pays de la Loire', 'normandie': 'Normandie', 'bourgogne-franche-comte': 'Bourgogne-FC',
  'centre-val-de-loire': 'Centre-Val de Loire', 'corse': 'Corse', 'guadeloupe': 'Guadeloupe',
  'martinique': 'Martinique', 'guyane': 'Guyane', 'la-reunion': 'La Réunion', 'mayotte': 'Mayotte',
};

type SortKey = 'score' | 'yield' | 'price' | 'name' | 'communes';

export function DepartmentsListPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sort, setSort] = useState<SortKey>('score');
  const [groupByRegion, setGroupByRegion] = useState(false);

  useEffect(() => {
    fetchDepartments().then(setDepartments).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const uniqueRegions = useMemo(() => [...new Set(departments.map(d => d.regionSlug))].sort(), [departments]);

  const filtered = departments
    .filter(d => {
      const q = search.toLowerCase();
      return (d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)) &&
             (!regionFilter || d.regionSlug === regionFilter);
    })
    .sort((a, b) => {
      if (sort === 'score') return b.avgGlobalScore - a.avgGlobalScore;
      if (sort === 'yield') return n(b.avgApartmentYield) - n(a.avgApartmentYield);
      if (sort === 'price') return n(b.avgApartmentPrice) - n(a.avgApartmentPrice);
      if (sort === 'communes') return b.communesCount - a.communesCount;
      return a.name.localeCompare(b.name, 'fr');
    });

  const grouped = useMemo(() => {
    if (!groupByRegion) return null;
    const map: Record<string, DepartmentSummary[]> = {};
    filtered.forEach(d => {
      if (!map[d.regionSlug]) map[d.regionSlug] = [];
      map[d.regionSlug].push(d);
    });
    return map;
  }, [filtered, groupByRegion]);

  const DeptCard = ({ d }: { d: DepartmentSummary }) => (
    <button onClick={() => navigate(`/departments/${d.code}`)}
      className="card card-hover p-4 text-left flex items-center gap-3 group">
      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black t-primary text-sm shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        {d.code}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold t-primary text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{d.name}</p>
        <p className="text-xs t-muted truncate">{REGIONS_META[d.regionSlug] ?? d.regionName} · {d.communesCount} communes</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] t-muted">Rend. {fmt.pct(d.avgApartmentYield, 1)}</span>
          <span className="text-[10px] t-muted">Prix {d.avgApartmentPrice ? `${Math.round(d.avgApartmentPrice).toLocaleString('fr-FR')}€/m²` : '—'}</span>
        </div>
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${scoreBg(d.avgGlobalScore)}`}>{d.avgGlobalScore}</span>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black t-primary">Les 96 départements de France</h1>
          <p className="text-sm t-muted mt-0.5">Explorez chaque département et ses opportunités</p>
        </div>
        <button onClick={() => setGroupByRegion(g => !g)}
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-colors ${groupByRegion ? 'bg-blue-600 text-white border-blue-600' : 'btn-ghost border-slate-200 dark:border-slate-700'}`}>
          <SlidersHorizontal size={13}/> Grouper par région
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Nom ou code département…" className="input-base pl-8 py-1.5 text-xs w-52" />
        </div>
        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="select-base text-xs py-1.5">
          <option value="">Toutes les régions</option>
          {uniqueRegions.map(s => <option key={s} value={s}>{REGIONS_META[s] ?? s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="select-base text-xs py-1.5">
          <option value="score">Par score</option>
          <option value="yield">Par rendement</option>
          <option value="price">Par prix</option>
          <option value="communes">Par nb communes</option>
          <option value="name">Alphabétique</option>
        </select>
        <span className="text-xs t-muted flex items-center">{filtered.length} département{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="card p-4 h-20 animate-pulse" />)}
        </div>
      ) : grouped ? (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a],[b]) => (REGIONS_META[a]??a).localeCompare(REGIONS_META[b]??b, 'fr')).map(([slug, depts]) => (
            <div key={slug}>
              <h2 className="font-bold t-primary mb-3 flex items-center gap-2">
                <span className="text-sm">{REGIONS_META[slug] ?? slug}</span>
                <span className="text-xs t-muted">({depts.length} dép.)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {depts.map(d => <DeptCard key={d.code} d={d} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {filtered.map(d => <DeptCard key={d.code} d={d} />)}
        </div>
      )}
    </div>
  );
}
