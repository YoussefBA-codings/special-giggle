import { useState, useEffect } from 'react';
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

function Skeleton() {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="h-4 bg-slate-800 rounded animate-pulse w-48 mb-3" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
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
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    fetchCities()
      .then((data) => { setCities(data); setLoading(false); })
      .catch((err: Error) => { setError(err.message); setLoading(false); });
  }, []);

  function handleNavigate(p: string) {
    setPage(p as Page);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-900 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <h2 className="text-slate-100 font-bold mb-2">Données introuvables</h2>
          <p className="text-sm text-slate-500 mb-1">{error}</p>
          <p className="text-xs text-slate-600 mt-2">
            Placez <code className="bg-slate-800 px-1 rounded text-slate-400">cities.final.json</code> dans{' '}
            <code className="bg-slate-800 px-1 rounded text-slate-400">public/data/</code>
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
            <RefreshCw size={13} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar
        page={page}
        onNavigate={setPage}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          page={page}
          totalCities={cities.length}
          loading={loading}
          globalSearch={globalSearch}
          onGlobalSearch={(q) => {
            setGlobalSearch(q);
            if (q.trim()) setPage('explorer');
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <Skeleton />
          ) : (
            <>
              {page === 'dashboard' && <DashboardPage cities={cities} onCityClick={setSelectedCity} onNavigate={handleNavigate} />}
              {page === 'opportunities' && <OpportunitiesPage cities={cities} onCityClick={setSelectedCity} />}
              {page === 'explorer' && <CityExplorerPage cities={cities} globalSearch={globalSearch} onCityClick={setSelectedCity} />}
              {page === 'compare' && <ComparePage cities={cities} />}
              {page === 'profiles' && <InvestorProfilesPage cities={cities} onCityClick={setSelectedCity} />}
              {page === 'riskmap' && <RiskMapPage cities={cities} onCityClick={setSelectedCity} />}
              {page === 'methodology' && <MethodologyPage />}
            </>
          )}
        </main>
      </div>

      <CityDetailsDrawer city={selectedCity} onClose={() => setSelectedCity(null)} />
    </div>
  );
}
