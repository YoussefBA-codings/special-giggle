import React from 'react';
import { Sun, Moon, Menu, ChevronRight, Database } from 'lucide-react';
import { useLocation, useNavigate, Link } from '../../router';
import { useOnlineCount } from '../../hooks/useOnlineCount';

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

interface Crumb { label: string; path?: string }

function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'France' }];

  const crumbs: Crumb[] = [{ label: 'France', path: '/' }];

  const SEGMENT_LABELS: Record<string, string> = {
    regions: 'Régions', departments: 'Départements', explorer: 'Explorateur',
    map: 'Carte', rankings: 'Classements', compare: 'Comparer',
    methodology: 'Méthodologie', cities: 'Villes',
  };

  const RANKING_LABELS: Record<string, string> = {
    global: 'Investissement équilibré', cashflow: 'Cashflow', yield: 'Rendement réaliste',
    patrimonial: 'Patrimonial', beginner: 'Débutants', 'low-risk': 'Faible risque',
    'yield-traps': 'Yield traps', 'long-term': 'À surveiller',
    'rental-demand': 'Dem. locative', 'price-accessible': 'Prix accessibles',
  };

  let builtPath = '';
  segments.forEach((seg, i) => {
    builtPath += '/' + seg;
    const isLast = i === segments.length - 1;
    if (segments[i - 1] === 'rankings') {
      crumbs.push({ label: RANKING_LABELS[seg] ?? seg, path: isLast ? undefined : builtPath });
      return;
    }
    if (['regions', 'departments', 'cities'].includes(segments[i - 1])) {
      const pretty = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({ label: pretty, path: isLast ? undefined : builtPath });
      return;
    }
    crumbs.push({ label: SEGMENT_LABELS[seg] ?? seg, path: isLast ? undefined : builtPath });
  });
  return crumbs;
}

// ---------------------------------------------------------------------------
// Quick nav
// ---------------------------------------------------------------------------

const QUICK_NAV = [
  { label: 'France',       path: '/' },
  { label: 'Régions',      path: '/regions' },
  { label: 'Départements', path: '/departments' },
  { label: 'Explorateur',  path: '/explorer' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  page?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMobileSidebar: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Header({ isDark, onToggleTheme, onOpenMobileSidebar }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onlineCount = useOnlineCount();

  const crumbs = buildBreadcrumbs(pathname);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function isQuickNavActive(path: string) {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <header className="header-bg sticky top-0 z-20 px-4 sm:px-5 py-2.5 flex items-center gap-3 shrink-0">
      {/* Hamburger */}
      <button
        onClick={onOpenMobileSidebar}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 t-secondary transition-colors shrink-0"
        aria-label="Ouvrir le menu"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb — desktop */}
      <nav className="hidden md:flex items-center gap-1 min-w-0 flex-1" aria-label="Fil d'ariane">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={12} className="t-muted shrink-0" />}
            {crumb.path ? (
              <Link to={crumb.path} className="text-sm t-secondary hover:t-primary transition-colors truncate max-w-[140px] hover:underline underline-offset-2">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold t-primary truncate max-w-[200px]">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Mobile title */}
      <div className="flex-1 min-w-0 md:hidden">
        <p className="text-sm font-bold t-primary truncate">{crumbs[crumbs.length - 1]?.label ?? 'Simulateur Locatif'}</p>
      </div>

      {/* Quick nav — desktop */}
      <div className="hidden lg:flex items-center gap-0.5 shrink-0">
        {QUICK_NAV.map((item) => {
          const active = isQuickNavActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'btn-ghost t-secondary hover:t-primary'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Data chip */}
      <div className="hidden md:flex items-center gap-1.5 text-xs t-muted shrink-0 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
        <Database size={11} className="text-emerald-500" />
        <span>34 746 communes</span>
      </div>

      {/* Online users */}
      {onlineCount !== null && onlineCount > 0 && (
        <div
          className="hidden md:flex items-center gap-1.5 text-xs shrink-0 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full"
          title={`${onlineCount} utilisateur${onlineCount > 1 ? 's' : ''} connecté${onlineCount > 1 ? 's' : ''} en ce moment`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="t-muted font-medium">{onlineCount}</span>
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {isDark
          ? <Sun size={16} className="text-amber-400" />
          : <Moon size={16} className="text-slate-500" />
        }
      </button>
    </header>
  );
}
