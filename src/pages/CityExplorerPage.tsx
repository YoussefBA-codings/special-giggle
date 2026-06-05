import { useState, useEffect, useCallback } from 'react';
import type { CommuneIndex } from '../types/api';
import type { Filters } from '../types/filters';
import { DEFAULT_FILTERS, FILTER_PRESETS } from '../types/filters';
import { filtersToApiParams, hasActiveFilters } from '../lib/filters';
import { fetchCitiesPage } from '../lib/api';
import { exportToCSV } from '../lib/export';
import { CitiesTable } from '../components/explorer/CitiesTable';
import { RotateCcw, Download, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

const STORAGE_KEY = 'immoinsight-explorer-filters';
const PAGE_SIZE = 30;

function loadFilters(): Filters {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...DEFAULT_FILTERS, ...JSON.parse(s) };
  } catch { /* ignore */ }
  return DEFAULT_FILTERS;
}

interface Props {
  globalSearch: string;
  onCityClick: (inseeCode: string) => void;
}

const PROFILES = [
  { value: '', label: 'Tous profils' },
  { value: 'HIGH_YIELD', label: 'Cashflow (HIGH_YIELD)' },
  { value: 'BEGINNER_FRIENDLY', label: 'Débutant' },
  { value: 'PATRIMONIAL', label: 'Patrimonial' },
  { value: 'BALANCED_OPPORTUNITY', label: 'Équilibré' },
  { value: 'YIELD_TRAP', label: 'Piège rendement' },
  { value: 'DEFAULT', label: 'Standard' },
];

const RISKS = [
  { value: '', label: 'Tous risques' },
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Modéré' },
  { value: 'HIGH', label: 'Élevé' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-xs block mb-1">{label}</label>
      {children}
    </div>
  );
}

export function CityExplorerPage({ globalSearch, onCityClick }: Props) {
  const [filters, setFilters] = useState<Filters>(() => {
    const f = loadFilters();
    if (globalSearch) f.search = globalSearch;
    return f;
  });
  const [page, setPage] = useState(1);
  const [cities, setCities] = useState<CommuneIndex[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // Sync global search
  useEffect(() => {
    if (globalSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: globalSearch }));
      setPage(1);
    }
  }, [globalSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist filters
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch { /* ignore */ }
  }, [filters]);

  // Fetch from API whenever filters/page change
  const fetchData = useCallback(() => {
    setLoading(true);
    const params = { ...filtersToApiParams(filters), page, limit: PAGE_SIZE };
    fetchCitiesPage(params)
      .then((res) => {
        setCities(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleFilterChange(key: keyof Filters, value: Filters[keyof Filters]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function applyPreset(presetId: string) {
    const preset = FILTER_PRESETS.find((p) => p.id === presetId);
    if (preset) { setFilters({ ...DEFAULT_FILTERS, ...preset.filters }); setPage(1); }
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  function handleSortChange(key: string, dir: 'asc' | 'desc') {
    setFilters((prev) => ({ ...prev, sortBy: key, sortOrder: dir }));
    setPage(1);
  }

  const active = hasActiveFilters(filters);

  return (
    <div className="p-6 space-y-4">
      {/* Filters Panel */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <button onClick={() => setFiltersOpen((p) => !p)} className="flex items-center gap-2 t-secondary hover:t-primary transition-colors">
            <SlidersHorizontal size={14} />
            <span className="text-sm font-semibold">Filtres</span>
            {active && <span className="w-2 h-2 rounded-full bg-blue-500" />}
            {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs t-muted">
              {loading ? 'Chargement…' : `${total.toLocaleString('fr-FR')} résultat${total > 1 ? 's' : ''}`}
            </span>
            {active && (
              <button onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1 py-1">
                <RotateCcw size={11} /> Réinitialiser
              </button>
            )}
            <button onClick={() => exportToCSV(cities)} className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3">
              <Download size={11} /> CSV
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="p-4 space-y-4">
            {/* Presets */}
            <div>
              <p className="label-xs mb-2">Presets rapides</p>
              <div className="flex flex-wrap gap-1.5">
                {FILTER_PRESETS.map((preset) => (
                  <button key={preset.id} onClick={() => applyPreset(preset.id)} title={preset.description}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 t-secondary text-xs transition-colors">
                    <span>{preset.icon}</span><span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Recherche">
                <input type="text" placeholder="Ville, INSEE, code postal…" value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)} className="input-base w-full" />
              </Field>
              <Field label="Profil investissement">
                <select value={filters.profile} onChange={(e) => handleFilterChange('profile', e.target.value)} className="input-base w-full">
                  {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </Field>
              <Field label="Niveau de risque">
                <select value={filters.riskLevel} onChange={(e) => handleFilterChange('riskLevel', e.target.value as Filters['riskLevel'])} className="input-base w-full">
                  {RISKS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="Département">
                <input type="text" placeholder="Ex: 75, 92, 69…" value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)} className="input-base w-full" />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Rendement min (%)">
                <input type="number" placeholder="Ex: 6" value={filters.minYield || ''} min={0} max={25} step={0.5}
                  onChange={(e) => handleFilterChange('minYield', parseFloat(e.target.value) || 0)} className="input-base w-full" />
              </Field>
              <Field label="Rendement max (%)">
                <input type="number" placeholder="Ex: 12" value={filters.maxYield || ''} min={0} max={25} step={0.5}
                  onChange={(e) => handleFilterChange('maxYield', parseFloat(e.target.value) || 0)} className="input-base w-full" />
              </Field>
              <Field label="Prix max (€/m²)">
                <input type="number" placeholder="Ex: 4000" value={filters.maxPrice || ''} min={0} step={100}
                  onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 0)} className="input-base w-full" />
              </Field>
              <Field label="Score global min">
                <input type="number" placeholder="Ex: 50" value={filters.minGlobalScore || ''} min={0} max={100}
                  onChange={(e) => handleFilterChange('minGlobalScore', parseFloat(e.target.value) || 0)} className="input-base w-full" />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs t-muted mt-3">Chargement…</p>
        </div>
      ) : (
        <CitiesTable
          cities={cities}
          total={total}
          page={page}
          totalPages={totalPages}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onPageChange={setPage}
          onSortChange={handleSortChange}
          onCityClick={onCityClick}
        />
      )}
    </div>
  );
}
