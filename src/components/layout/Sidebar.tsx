import { BarChart2, TrendingUp, Search, GitCompare, Users, AlertTriangle, BookOpen, Building2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export type Page = 'dashboard' | 'opportunities' | 'explorer' | 'compare' | 'profiles' | 'riskmap' | 'methodology';

interface NavItem { id: Page; label: string; icon: React.ReactNode; }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: <BarChart2 size={18} /> },
  { id: 'opportunities', label: 'Opportunités',  icon: <TrendingUp size={18} /> },
  { id: 'explorer',      label: 'Explorer',       icon: <Search size={18} /> },
  { id: 'compare',       label: 'Comparer',       icon: <GitCompare size={18} /> },
  { id: 'profiles',      label: 'Profils',        icon: <Users size={18} /> },
  { id: 'riskmap',       label: 'Risk Map',       icon: <AlertTriangle size={18} /> },
  { id: 'methodology',   label: 'Méthodologie',   icon: <BookOpen size={18} /> },
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
  return (
    <aside
      className={`
        sidebar-bg flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-200 z-50
        fixed md:relative
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-slate-200 dark:border-slate-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Building2 size={14} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-black t-primary leading-none">ImmoInsight</p>
              <p className="text-[10px] t-muted mt-0.5">Île-de-France</p>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        <button onClick={onMobileClose} className="md:hidden btn-ghost p-1">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                ${active
                  ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle — desktop only */}
      <div className="hidden md:block p-2 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg btn-ghost"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
