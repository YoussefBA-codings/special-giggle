import { Search, Database, RefreshCw, Sun, Moon, Menu } from 'lucide-react';
import type { Page } from './Sidebar';

const PAGE_LABELS: Record<Page, { title: string; subtitle: string }> = {
  dashboard:     { title: 'Vue d\'ensemble',    subtitle: 'Résumé du marché IDF' },
  opportunities: { title: 'Meilleures villes',  subtitle: 'Classements et opportunités' },
  explorer:      { title: 'Explorer',           subtitle: 'Filtrez les 1 265 communes' },
  compare:       { title: 'Comparer',           subtitle: 'Comparez jusqu\'à 4 villes côte à côte' },
  profiles:      { title: 'Stratégies',         subtitle: 'Choisissez votre profil d\'investisseur' },
  riskmap:       { title: 'Carte des risques',  subtitle: 'Visualisations rendement / risque / transport' },
  methodology:   { title: 'Comment ça marche', subtitle: 'Explication des scores et données' },
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
  const { title, subtitle } = PAGE_LABELS[page];

  return (
    <header className="header-bg sticky top-0 z-20 px-4 sm:px-5 py-2.5 flex items-center gap-3 shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onOpenMobileSidebar}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 t-secondary transition-colors shrink-0"
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <h1 className="text-sm font-bold t-primary leading-tight truncate">{title}</h1>
        <p className="text-[10px] t-muted leading-tight hidden md:block">{subtitle}</p>
      </div>
      {/* Mobile: just title */}
      <div className="flex-1 min-w-0 sm:hidden">
        <h1 className="text-sm font-bold t-primary truncate">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden sm:block">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
        <input
          type="text"
          placeholder="Chercher une ville…"
          value={globalSearch}
          onChange={(e) => onGlobalSearch(e.target.value)}
          className="input-base w-40 md:w-52 pl-8 py-1.5 text-xs"
        />
      </div>

      {/* Status chip */}
      <div className="hidden md:flex items-center gap-1.5 text-xs t-muted shrink-0 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
        {loading
          ? <RefreshCw size={11} className="animate-spin text-blue-500" />
          : <Database size={11} className="text-emerald-500" />
        }
        <span>{loading ? 'Chargement…' : `${totalCities} villes`}</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark
          ? <Sun size={16} className="text-amber-400" />
          : <Moon size={16} className="text-slate-500" />
        }
      </button>
    </header>
  );
}
