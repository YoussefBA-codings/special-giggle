import { Search, SlidersHorizontal, RotateCcw, Download } from 'lucide-react';
import type { Filters } from '../types/city';

interface Props {
  filters: Filters;
  departments: string[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
  onExport: () => void;
  resultCount: number;
}

const PROPERTY_TYPES = [
  { value: 'all', label: 'Tous' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
] as const;

export function FiltersBar({ filters, departments, onChange, onReset, onExport, resultCount }: Props) {
  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters =
    filters.search !== '' ||
    filters.department !== '' ||
    filters.propertyType !== 'all' ||
    filters.minYield > 0 ||
    filters.maxPrice > 0 ||
    filters.minRent > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={16} className="text-slate-500" />
        <span className="text-sm font-semibold text-slate-700">Filtres</span>
        <span className="ml-auto text-xs text-slate-400">{resultCount} résultat{resultCount > 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Search */}
        <div className="relative xl:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une ville..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Department */}
        <select
          value={filters.department}
          onChange={(e) => update('department', e.target.value)}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
        >
          <option value="">Tous les départements</option>
          {departments.map((dep) => (
            <option key={dep} value={dep}>Dép. {dep}</option>
          ))}
        </select>

        {/* Property type */}
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => update('propertyType', type.value)}
              className={`flex-1 py-2 px-2 text-xs font-medium transition-colors ${
                filters.propertyType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Min yield */}
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
          <input
            type="number"
            placeholder="Rendement min"
            value={filters.minYield || ''}
            min={0}
            max={20}
            step={0.5}
            onChange={(e) => update('minYield', parseFloat(e.target.value) || 0)}
            className="w-full pr-8 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Max price */}
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">€/m²</span>
          <input
            type="number"
            placeholder="Prix max"
            value={filters.maxPrice || ''}
            min={0}
            step={100}
            onChange={(e) => update('maxPrice', parseFloat(e.target.value) || 0)}
            className="w-full pr-12 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Min rent */}
      <div className="flex gap-3 mt-3">
        <div className="relative w-48">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">€/m²</span>
          <input
            type="number"
            placeholder="Loyer min"
            value={filters.minRent || ''}
            min={0}
            step={0.5}
            onChange={(e) => update('minRent', parseFloat(e.target.value) || 0)}
            className="w-full pr-12 pl-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="ml-auto flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser
            </button>
          )}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
