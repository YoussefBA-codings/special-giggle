import { useState, useMemo } from 'react';
import { Search, Plus, X } from 'lucide-react';
import type { City } from '../types/city';
import { CompareRadar } from '../components/compare/CompareRadar';
import { EmptyState } from '../components/ui/EmptyState';

interface Props { cities: City[]; }

export function ComparePage({ cities }: Props) {
  const [compareList, setCompareList] = useState<City[]>([]);
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return cities
      .filter((c) => c.city.toLowerCase().includes(q) || c.postalCode.includes(q) || c.department.includes(q))
      .filter((c) => !compareList.find((cc) => cc.city === c.city && cc.postalCode === c.postalCode))
      .slice(0, 8);
  }, [search, cities, compareList]);

  function addCity(city: City) {
    if (compareList.length >= 4) return;
    setCompareList((prev) => [...prev, city]);
    setSearch('');
  }

  function removeCity(city: City) {
    setCompareList((prev) => prev.filter((c) => !(c.city === city.city && c.postalCode === city.postalCode)));
  }

  const COLORS = ['border-indigo-400 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300',
    'border-emerald-400 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
    'border-amber-400 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    'border-red-400 dark:border-red-700 text-red-700 dark:text-red-300'];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-black t-primary mb-1">Comparer des villes</h2>
        <p className="text-sm t-muted">Sélectionnez jusqu'à 4 communes</p>
      </div>

      {compareList.length < 4 && (
        <div className="card p-4">
          <p className="label-xs mb-3">Ajouter une ville</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted" />
            <input type="text" placeholder="Nom, code postal ou département…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-base w-full pl-8" />
          </div>
          {results.length > 0 && (
            <div className="mt-2 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              {results.map((city) => (
                <button key={city.city + city.postalCode} onClick={() => addCity(city)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors text-left">
                  <div>
                    <span className="text-sm font-semibold t-primary">{city.city}</span>
                    <span className="text-xs t-muted ml-2">Dép. {city.department} · {city.postalCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs t-muted">{city.investment?.profile ?? ''}</span>
                    <Plus size={14} className="text-blue-500 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {compareList.length > 0 ? (
        <>
          <div className="flex gap-2 flex-wrap">
            {compareList.map((city, i) => (
              <div key={city.city} className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2 ${COLORS[i]}`}>
                <span className="font-semibold text-sm">{city.city}</span>
                <span className="text-xs opacity-60">{city.department}</span>
                <button onClick={() => removeCity(city)} className="hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
              </div>
            ))}
          </div>
          <CompareRadar cities={compareList} onRemove={removeCity} />
        </>
      ) : (
        <EmptyState title="Aucune ville sélectionnée" description="Recherchez et sélectionnez des villes à comparer." />
      )}
    </div>
  );
}
