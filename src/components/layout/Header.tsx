import { Search, Database, RefreshCw } from 'lucide-react';
import type { Page } from './Sidebar';

const PAGE_LABELS: Record<Page, string> = {
  dashboard: 'Dashboard',
  opportunities: 'Opportunités',
  explorer: 'City Explorer',
  compare: 'Comparer des villes',
  profiles: 'Profils investisseurs',
  riskmap: 'Risk Map',
  methodology: 'Méthodologie',
};

interface Props {
  page: Page;
  totalCities: number;
  loading: boolean;
  globalSearch: string;
  onGlobalSearch: (q: string) => void;
}

export function Header({ page, totalCities, loading, globalSearch, onGlobalSearch }: Props) {
  return (
    <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center gap-4">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-slate-100 leading-none">{PAGE_LABELS[page]}</h1>
      </div>

      {/* Global search */}
      <div className="relative w-64 hidden md:block">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Rechercher une ville..."
          value={globalSearch}
          onChange={(e) => onGlobalSearch(e.target.value)}
          className="input-dark w-full pl-8 py-1.5 text-xs"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
        {loading ? (
          <RefreshCw size={12} className="animate-spin text-blue-400" />
        ) : (
          <Database size={12} className="text-emerald-500" />
        )}
        <span className={loading ? 'text-blue-400' : 'text-slate-500'}>
          {loading ? 'Chargement…' : `${totalCities} communes`}
        </span>
      </div>
    </header>
  );
}
