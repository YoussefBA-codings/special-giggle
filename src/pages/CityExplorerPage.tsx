import { useState, useEffect, useMemo } from 'react';
import type { City } from '../types/city';
import type { Filters } from '../types/filters';
import { DEFAULT_FILTERS } from '../types/filters';
import { applyFilters } from '../lib/filters';
import { getDepartments, getAllTags } from '../lib/statistics';
import { exportToCSV } from '../lib/export';
import { FiltersPanel } from '../components/explorer/FiltersPanel';
import { CitiesTable } from '../components/explorer/CitiesTable';

const STORAGE_KEY = 'immoinsight-explorer-filters';

interface Props {
  cities: City[];
  globalSearch: string;
  onCityClick: (city: City) => void;
}

function loadFilters(): Filters {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...DEFAULT_FILTERS, ...JSON.parse(s) };
  } catch { /* ignore */ }
  return DEFAULT_FILTERS;
}

export function CityExplorerPage({ cities, globalSearch, onCityClick }: Props) {
  const [filters, setFilters] = useState<Filters>(() => {
    const f = loadFilters();
    if (globalSearch) f.search = globalSearch;
    return f;
  });

  // Sync global search from header
  useEffect(() => {
    if (globalSearch !== filters.search) {
      setFilters((prev) => ({ ...prev, search: globalSearch }));
    }
  }, [globalSearch]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(filters)); } catch { /* ignore */ }
  }, [filters]);

  const departments = useMemo(() => getDepartments(cities), [cities]);
  const allTags = useMemo(() => getAllTags(cities), [cities]);
  const filtered = useMemo(() => applyFilters(cities, filters), [cities, filters]);

  return (
    <div className="p-6 space-y-4">
      <FiltersPanel
        filters={filters}
        departments={departments}
        allTags={allTags}
        resultCount={filtered.length}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
        onExport={() => exportToCSV(filtered)}
      />
      <CitiesTable cities={filtered} onCityClick={onCityClick} />
    </div>
  );
}
