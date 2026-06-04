import { BarChart2, TrendingUp, Search, GitCompare, Users, AlertTriangle, BookOpen, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export type Page = 'dashboard' | 'opportunities' | 'explorer' | 'compare' | 'profiles' | 'riskmap' | 'methodology';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 size={18} /> },
  { id: 'opportunities', label: 'Opportunités', icon: <TrendingUp size={18} /> },
  { id: 'explorer', label: 'Explorer', icon: <Search size={18} /> },
  { id: 'compare', label: 'Comparer', icon: <GitCompare size={18} /> },
  { id: 'profiles', label: 'Profils', icon: <Users size={18} /> },
  { id: 'riskmap', label: 'Risk Map', icon: <AlertTriangle size={18} /> },
  { id: 'methodology', label: 'Méthodologie', icon: <BookOpen size={18} /> },
];

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ page, onNavigate, collapsed, onToggle }: Props) {
  return (
    <aside className={`flex flex-col bg-slate-950 border-r border-slate-800 h-screen sticky top-0 transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Building2 size={14} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-black text-slate-100 leading-none">ImmoInsight</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Île-de-France</p>
          </div>
        )}
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
