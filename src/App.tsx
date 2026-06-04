import { useState, useEffect, useMemo } from 'react';
import { Building2, Home, BarChart2, List, Trophy, AlertCircle } from 'lucide-react';

import type { CityWithScore, Filters, PropertyType } from './types/city';
import { fetchCities, getDepartments, exportToCSV } from './lib/data';
import { enrichCities } from './lib/calculations';

import { StatsCards } from './components/StatsCards';
import { FiltersBar } from './components/FiltersBar';
import { CitiesTable } from './components/CitiesTable';
import { TopOpportunities } from './components/TopOpportunities';
import { ChartsSection } from './components/ChartsSection';
import { CityDetailsDrawer } from './components/CityDetailsDrawer';
import { SkeletonDashboard } from './components/SkeletonLoader';

const STORAGE_KEY = 'idf-dashboard-filters';

const DEFAULT_FILTERS: Filters = {
  search: '',
  department: '',
  propertyType: 'all',
  minYield: 0,
  maxPrice: 0,
  minRent: 0,
};

function loadFilters(): Filters {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_FILTERS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_FILTERS;
}

type Tab = 'table' | 'top' | 'charts';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'table', label: 'Classement', icon: <List size={15} /> },
  { key: 'top', label: 'Top opportunités', icon: <Trophy size={15} /> },
  { key: 'charts', label: 'Graphiques', icon: <BarChart2 size={15} /> },
];

export default function App() {
  const [cities, setCities] = useState<CityWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Single source of truth: filters.propertyType drives both the view switcher and the data filter
  const [filters, setFilters] = useState<Filters>(loadFilters);
  const [selectedCity, setSelectedCity] = useState<CityWithScore | null>(null);
  const [tab, setTab] = useState<Tab>('table');

  useEffect(() => {
    fetchCities()
      .then((data) => {
        setCities(enrichCities(data));
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ignore
    }
  }, [filters]);

  const departments = useMemo(() => getDepartments(cities), [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.city.toLowerCase().includes(q) && !c.postalCode.includes(q)) return false;
      }
      if (filters.department && c.department !== filters.department) return false;

      const { apartment: apt, house } = c.prices;

      const aptYield = apt.grossYield ?? 0;
      const aptPrice = apt.average ?? 0;
      const aptRent = apt.rent ?? 0;
      const houseYield = house.grossYield ?? 0;
      const housePrice = house.average ?? 0;
      const houseRent = house.rent ?? 0;

      if (filters.propertyType === 'apartment') {
        if (filters.minYield > 0 && aptYield < filters.minYield) return false;
        if (filters.maxPrice > 0 && aptPrice > filters.maxPrice) return false;
        if (filters.minRent > 0 && aptRent < filters.minRent) return false;
      } else if (filters.propertyType === 'house') {
        if (filters.minYield > 0 && houseYield < filters.minYield) return false;
        if (filters.maxPrice > 0 && housePrice > filters.maxPrice) return false;
        if (filters.minRent > 0 && houseRent < filters.minRent) return false;
      } else {
        // 'all': keep city if it satisfies filters for EITHER property type
        const aptOk =
          (filters.minYield === 0 || aptYield >= filters.minYield) &&
          (filters.maxPrice === 0 || (aptPrice > 0 && aptPrice <= filters.maxPrice)) &&
          (filters.minRent === 0 || aptRent >= filters.minRent);
        const houseOk =
          (filters.minYield === 0 || houseYield >= filters.minYield) &&
          (filters.maxPrice === 0 || (housePrice > 0 && housePrice <= filters.maxPrice)) &&
          (filters.minRent === 0 || houseRent >= filters.minRent);
        if (!aptOk && !houseOk) return false;
      }

      return true;
    });
  }, [cities, filters]);

  function handleFiltersChange(f: Filters) {
    setFilters(f);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-4 mb-6">
          <div className="max-w-screen-xl mx-auto">
            <div className="h-7 w-64 bg-slate-200 rounded animate-pulse" />
          </div>
        </header>
        <main className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <SkeletonDashboard />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Données introuvables</h2>
          <p className="text-sm text-slate-500 mb-1">{error}</p>
          <p className="text-xs text-slate-400">
            Placez votre fichier <code className="bg-slate-100 px-1 rounded">cities.json</code> dans{' '}
            <code className="bg-slate-100 px-1 rounded">public/data/</code>
          </p>
        </div>
      </div>
    );
  }

  // propertyType from filters is the single source of truth for the view
  const propertyView = filters.propertyType;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">
              Rentabilité immobilière
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Île-de-France · {cities.length} villes analysées</p>
          </div>

          {/* Property view switcher — updates filters.propertyType directly */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {([
              { value: 'all' as const, label: 'Tous', icon: null },
              { value: 'apartment' as const, label: 'Appt', icon: <Building2 size={13} /> },
              { value: 'house' as const, label: 'Maison', icon: <Home size={13} /> },
            ] as { value: PropertyType | 'all'; label: string; icon: React.ReactNode }[]).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilters((prev) => ({ ...prev, propertyType: opt.value }))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  propertyView === opt.value
                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <StatsCards cities={filteredCities} />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <FiltersBar
          filters={filters}
          departments={departments}
          onChange={handleFiltersChange}
          onReset={handleReset}
          onExport={() => exportToCSV(filteredCities)}
          resultCount={filteredCities.length}
        />

        {/* Tab content */}
        {tab === 'table' && (
          <CitiesTable
            cities={filteredCities}
            propertyView={propertyView}
            onCityClick={setSelectedCity}
          />
        )}

        {tab === 'top' && (
          <TopOpportunities cities={filteredCities} onCityClick={setSelectedCity} />
        )}

        {tab === 'charts' && (
          <ChartsSection cities={filteredCities} />
        )}
      </main>

      {/* City detail drawer */}
      <CityDetailsDrawer city={selectedCity} onClose={() => setSelectedCity(null)} />
    </div>
  );
}
