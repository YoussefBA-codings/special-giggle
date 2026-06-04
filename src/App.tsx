import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { City } from './types/city';
import { fetchCities } from './lib/data';
import { Sidebar, type Page } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CityDetailsDrawer } from './components/city/CityDetailsDrawer';
import { DashboardPage } from './pages/DashboardPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { CityExplorerPage } from './pages/CityExplorerPage';
import { ComparePage } from './pages/ComparePage';
import { InvestorProfilesPage } from './pages/InvestorProfilesPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { MethodologyPage } from './pages/MethodologyPage';

const THEME_KEY = 'immoinsight-theme';

function useTheme() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);
  return { isDark, toggle };
}

function Skeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-48 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const { isDark, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    fetchCities()
      .then((data) => { setCities(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-900 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-500 dark:text-red-400" />
          </div>
          <h2 className="t-primary font-bold mb-2">Données introuvables</h2>
          <p className="text-sm t-secondary mb-1">{error}</p>
          <p className="text-xs t-muted mt-2">
            Placez <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">cities.final.json</code> dans{' '}
            <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">public/data/</code>
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    // Root: relative so the fixed sidebar spacer + fixed sidebar line up
    <div className="flex min-h-screen page-bg">
      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar renders a fixed panel + a desktop spacer div internally */}
      <Sidebar
        page={page}
        onNavigate={(p) => { setPage(p); setMobileSidebarOpen(false); }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main content — flex-1 fills remaining space after spacer */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          page={page}
          totalCities={cities.length}
          loading={loading}
          globalSearch={globalSearch}
          onGlobalSearch={(q) => { setGlobalSearch(q); if (q.trim()) setPage('explorer'); }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto page-bg">
          {loading ? <Skeleton /> : (
            <>
              {page === 'dashboard'     && <DashboardPage    cities={cities} onCityClick={setSelectedCity} onNavigate={(p) => setPage(p as Page)} />}
              {page === 'opportunities' && <OpportunitiesPage cities={cities} onCityClick={setSelectedCity} />}
              {page === 'explorer'      && <CityExplorerPage  cities={cities} globalSearch={globalSearch} onCityClick={setSelectedCity} />}
              {page === 'compare'       && <ComparePage       cities={cities} />}
              {page === 'profiles'      && <InvestorProfilesPage cities={cities} onCityClick={setSelectedCity} />}
              {page === 'riskmap'       && <RiskMapPage       cities={cities} isDark={isDark} onCityClick={setSelectedCity} />}
              {page === 'methodology'   && <MethodologyPage />}
            </>
          )}
        </main>
      </div>

      <CityDetailsDrawer city={selectedCity} onClose={() => setSelectedCity(null)} />
    </div>
  );
}
