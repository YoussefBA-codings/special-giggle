import { useEffect, useState } from 'react';
import { Search, ArrowRight, TrendingUp, MapPin, Building2, Users } from 'lucide-react';
import { fetchRegions } from '../lib/api';
import type { RegionSummary } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg, scoreColor } from '../lib/insights';
import { useNavigate } from '../router';

type SortKey = 'score' | 'yield' | 'price' | 'name' | 'communes';

export function RegionsListPage() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState<RegionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('score');

  useEffect(() => {
    fetchRegions().then(setRegions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = regions
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'score') return b.avgGlobalScore - a.avgGlobalScore;
      if (sort === 'yield') return n(b.avgApartmentYield) - n(a.avgApartmentYield);
      if (sort === 'price') return n(b.avgApartmentPrice) - n(a.avgApartmentPrice);
      if (sort === 'communes') return b.communesCount - a.communesCount;
      return a.name.localeCompare(b.name, 'fr');
    });

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black t-primary">Les 18 régions de France</h1>
          <p className="text-sm t-muted mt-0.5">Choisissez une région pour explorer ses opportunités d'investissement</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Chercher une région…" className="input-base pl-8 py-1.5 text-xs w-48" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="select-base text-xs py-1.5">
            <option value="score">Par score</option>
            <option value="yield">Par rendement</option>
            <option value="price">Par prix</option>
            <option value="communes">Par nb communes</option>
            <option value="name">Alphabétique</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24 mb-4" />
              <div className="grid grid-cols-2 gap-2">{[...Array(4)].map((_, j) => <div key={j} className="h-12 bg-slate-100 dark:bg-slate-800 rounded" />)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((r, idx) => (
            <button key={r.slug} onClick={() => navigate(`/regions/${r.slug}`)}
              className="card card-hover p-5 text-left flex flex-col gap-3 group">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold t-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{r.name}</h2>
                  <p className="text-xs t-muted mt-0.5">{r.departmentCodes.length} départements · {r.communesCount.toLocaleString('fr-FR')} communes</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${scoreBg(r.avgGlobalScore)}`}>{r.avgGlobalScore}/100</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="elevated rounded-lg p-2.5 text-center">
                  <p className="label-xs mb-1">Rendement</p>
                  <p className={`text-sm font-bold ${scoreColor(n(r.avgApartmentYield) * 10)}`}>{fmt.pct(r.avgApartmentYield, 1)}</p>
                </div>
                <div className="elevated rounded-lg p-2.5 text-center">
                  <p className="label-xs mb-1">Prix moy.</p>
                  <p className="text-sm font-bold t-primary">{r.avgApartmentPrice ? `${Math.round(r.avgApartmentPrice).toLocaleString('fr-FR')}€` : '—'}</p>
                </div>
                <div className="elevated rounded-lg p-2.5 text-center">
                  <p className="label-xs mb-1">Population</p>
                  <p className="text-sm font-bold t-primary">{r.population >= 1e6 ? `${(r.population/1e6).toFixed(1)}M` : `${Math.round(r.population/1e3)}k`}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="t-muted">Rang national : #{idx + 1}</span>
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">Explorer <ArrowRight size={12}/></span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
