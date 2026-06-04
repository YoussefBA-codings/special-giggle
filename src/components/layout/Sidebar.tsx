import {
  BarChart2, TrendingUp, Search, GitCompare, Users,
  AlertTriangle, BookOpen, Building2, X, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

export type Page = 'dashboard' | 'opportunities' | 'explorer' | 'compare' | 'profiles' | 'riskmap' | 'methodology';

interface NavItem {
  id: Page;
  label: string;
  desc: string;        // short description for general public
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Vue d\'ensemble', desc: 'Résumé du marché',          icon: <BarChart2 size={18} /> },
  { id: 'opportunities', label: 'Meilleures villes', desc: 'Top classements',         icon: <TrendingUp size={18} /> },
  { id: 'explorer',      label: 'Explorer',         desc: 'Toutes les villes + filtres', icon: <Search size={18} /> },
  { id: 'compare',       label: 'Comparer',         desc: '2 à 4 villes côte à côte', icon: <GitCompare size={18} /> },
  { id: 'profiles',      label: 'Stratégies',       desc: 'Par profil investisseur',  icon: <Users size={18} /> },
  { id: 'riskmap',       label: 'Carte des risques',desc: 'Visualisations avancées',  icon: <AlertTriangle size={18} /> },
  { id: 'methodology',   label: 'Comment ça marche', desc: 'Explication des scores',  icon: <BookOpen size={18} /> },
];

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ page, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const width = collapsed ? 'w-14' : 'w-60';

  return (
    <>
      {/* Sidebar panel — fixed always, overlay on mobile */}
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
                <p className="text-[10px] t-muted mt-0.5">Île-de-France</p>
              </div>
            )}
          </div>
          {/* Mobile close X */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg btn-ghost shrink-0"
            aria-label="Fermer le menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onMobileClose(); }}
                title={item.desc}
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
                    <p className="text-sm font-semibold leading-tight truncate">{item.label}</p>
                    <p className={`text-[10px] leading-tight truncate mt-0.5 ${active ? 'text-blue-100' : 't-muted'}`}>
                      {item.desc}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
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

      {/* Desktop spacer — pushes content right, mirrors sidebar width */}
      <div className={`hidden md:block shrink-0 transition-all duration-200 ${width}`} aria-hidden />
    </>
  );
}
