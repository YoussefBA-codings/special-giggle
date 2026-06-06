import React from 'react';
import {
  Globe, Map, Layers, Search, MapPin, Trophy, TrendingUp,
  Percent, Building2, Star, GitCompare, BookOpen,
  PanelLeftClose, PanelLeftOpen, X, Lightbulb, Users, Activity,
} from 'lucide-react';
import { useLocation, useNavigate } from '../../router';

// ---------------------------------------------------------------------------
// Nav structure
// ---------------------------------------------------------------------------

interface NavItem {
  path: string;
  label: string;
  desc?: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Analyse',
    items: [
      { path: '/',            label: 'Vue France',    desc: 'Tableau de bord national', icon: <Globe size={18} /> },
      { path: '/regions',     label: 'Régions',       desc: '18 régions',               icon: <Map size={18} /> },
      { path: '/departments', label: 'Départements',  desc: '96 départements',          icon: <Layers size={18} /> },
    ],
  },
  {
    label: 'Recherche',
    items: [
      { path: '/explorer', label: 'Explorateur',  desc: '34 746 communes',       icon: <Search size={18} /> },
      { path: '/map',      label: 'Carte',         desc: 'Vue cartographique',    icon: <MapPin size={18} /> },
      { path: '/risk',     label: 'Carte risques', desc: 'Rendement vs risque',   icon: <Activity size={18} /> },
    ],
  },
  {
    label: 'Classements',
    items: [
      { path: '/rankings/global',     label: 'Investissement équilibré', desc: 'Top · données fiables',    icon: <Trophy size={18} /> },
      { path: '/rankings/yield',      label: 'Rendement réaliste',       desc: '4–10% · non-trap',        icon: <Percent size={18} /> },
      { path: '/rankings/patrimonial',label: 'Patrimonial',                                               icon: <Building2 size={18} /> },
      { path: '/rankings/beginner',   label: 'Villes débutants',                                         icon: <Star size={18} /> },
      { path: '/rankings/low-risk',   label: 'Faible risque',                                            icon: <TrendingUp size={18} /> },
      { path: '/opportunities',       label: 'Opportunités',             desc: '9 classements en un',     icon: <Lightbulb size={18} /> },
    ],
  },
  {
    label: 'Outils',
    items: [
      { path: '/compare',     label: 'Comparer',             desc: 'Jusqu\'à 4 villes',    icon: <GitCompare size={18} /> },
      { path: '/profiles',    label: 'Profils investisseurs', desc: 'Par stratégie',        icon: <Users size={18} /> },
      { path: '/methodology', label: 'Méthodologie',                                        icon: <BookOpen size={18} /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Active-route helper
// ---------------------------------------------------------------------------

function isActive(itemPath: string, pathname: string): boolean {
  if (itemPath === '/') return pathname === '/';
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  /** Legacy prop kept for compatibility — not used internally (router drives state). */
  page?: string;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** Legacy prop kept for compatibility. */
  onNavigate?: (path: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const width = collapsed ? 'w-14' : 'w-60';

  function handleNavClick(path: string) {
    navigate(path);
    onMobileClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          sidebar-bg flex flex-col
          transition-all duration-200 ease-in-out
          ${width}
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center justify-between px-3 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 size={15} className="text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-black t-primary leading-none">ImmoInsight</p>
                <p className="text-[10px] t-muted mt-0.5">France — 34 746 communes</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg btn-ghost shrink-0"
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Group label — hidden when collapsed */}
              {!collapsed && (
                <p className="label-xs px-3 mb-1 uppercase tracking-widest t-muted">
                  {group.label}
                </p>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path, pathname);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      title={collapsed ? (item.desc ?? item.label) : item.desc}
                      className={`
                        w-full flex items-center rounded-lg transition-all duration-150 text-left group
                        ${collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                        ${active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }
                      `}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight truncate">
                            {item.label}
                          </p>
                          {item.desc && (
                            <p className={`text-[10px] leading-tight truncate mt-0.5 ${active ? 'text-blue-100' : 't-muted'}`}>
                              {item.desc}
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop collapse toggle — pill tab on right edge */}
        <button
          onClick={onToggle}
          title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          className="
            hidden md:flex
            absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-10 rounded-r-full
            bg-white dark:bg-slate-800
            border border-l-0 border-slate-200 dark:border-slate-700
            items-center justify-center
            text-slate-400 dark:text-slate-500
            hover:text-blue-600 dark:hover:text-blue-400
            hover:bg-blue-50 dark:hover:bg-slate-700
            shadow-sm transition-colors z-10
          "
        >
          {collapsed
            ? <PanelLeftOpen size={12} />
            : <PanelLeftClose size={12} />
          }
        </button>
      </aside>

      {/* Desktop spacer — mirrors sidebar width */}
      <div className={`hidden md:block shrink-0 transition-all duration-200 ${width}`} aria-hidden />
    </>
  );
}

// Re-export Page type stub for legacy consumers (Header still imports it)
export type Page = string;
