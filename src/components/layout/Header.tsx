import { Search, Database, RefreshCw, Sun, Moon, Menu } from 'lucide-react';
import type { Page } from './Sidebar';

const PAGE_LABELS: Record<Page, string> = {
  dashboard:     'Dashboard',
  opportunities: 'Opportunités',
  explorer:      'City Explorer',
  compare:       'Comparer des villes',
  profiles:      'Profils investisseurs',
  riskmap:       'Risk Map',
  methodology:   'Méthodologie',
};

interface Props {
  page: Page;
  totalCities: number;
  loading: boolean;
  globalSearch: string;
  onGlobalSearch: (q: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
}

export function Header({ page, totalCities, loading, globalSearch, onGlobalSearch, isDark, onToggleTheme, onOpenMobileSidebar }: Props) {
  return (
    <header className="header-bg sticky top-0 z-20 px-4 sm:px-6 py-3 flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onOpenMobileSidebar}
        className="md:hidden btn-ghost p-1.5 shrink-0"
        aria-label="Menu"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm sm:text-base font-bold t-primary leading-none truncate">
          {PAGE_LABELS[page]}
        </h1>
      </div>

      {/* Global search — hidden on very small screens */}
      <div className="relative w-40 sm:w-56 hidden sm:block">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted" />
        <input
          type="text"
          placeholder="Rechercher…"
          value={globalSearch}
          onChange={(e) => onGlobalSearch(e.target.value)}
          className="input-base w-full pl-8 py-1.5 text-xs"
        />
      </div>

      {/* Status */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs t-muted shrink-0">
        {loading
          ? <RefreshCw size={12} className="animate-spin text-blue-500" />
          : <Database size={12} className="text-emerald-500" />
        }
        <span>{loading ? 'Chargement…' : `${totalCities} villes`}</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="btn-ghost p-1.5 rounded-lg shrink-0"
        aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {isDark
          ? <Sun size={16} className="text-amber-400" />
          : <Moon size={16} className="text-slate-600" />
        }
      </button>
    </header>
  );
}
