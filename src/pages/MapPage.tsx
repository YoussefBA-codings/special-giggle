import { useEffect, useRef, useState, useCallback } from 'react';
import type { CommuneIndex, RegionSummary, DepartmentSummary } from '../types/api';
import { fetchCitiesPage, fetchRegions, fetchDepartments, DEFAULT_QUALITY } from '../lib/api';
import { fmt, n } from '../lib/formatters';
import { useNavigate } from '../router';
import {
  Layers,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  AlertCircle,
  Plus,
  Minus,
  RotateCcw,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MetricKey = 'globalScore' | 'yieldScore' | 'patrimonialScore' | 'riskScore' | 'rentalDemandScore';

interface MapFilters {
  region: string;
  department: string;
  // Scores (API-side)
  minGlobalScore: number;
  minCashflowScore: number;
  minPatrimonialScore: number;
  // Scores (client-side — API ne les expose pas en param)
  minYieldScore: number;
  minRentalDemandScore: number;
  // Prix m²
  minPrice: number;
  maxPrice: number;
  // Rendement brut
  minYield: number;
  maxYield: number;
  // Population
  minPopulation: number;
  // Risque
  riskLevel: '' | 'LOW' | 'MEDIUM' | 'HIGH';
}

const DEFAULT_FILTERS: MapFilters = {
  region: '',
  department: '',
  minGlobalScore: 0,
  minCashflowScore: 0,
  minPatrimonialScore: 0,
  minYieldScore: 0,
  minRentalDemandScore: 0,
  minPrice: 0,
  maxPrice: 0,
  minYield: 0,
  maxYield: 0,
  minPopulation: 0,
  riskLevel: '',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function riskLabel(level: string): string {
  if (level === 'LOW') return 'Faible';
  if (level === 'MEDIUM') return 'Modéré';
  return 'Élevé';
}

function scoreToHsl(score: number, invert = false): string {
  const s = Math.max(0, Math.min(100, score));
  const hue = invert ? (100 - s) * 1.2 : s * 1.2;
  return `hsl(${hue}, 70%, 50%)`;
}

function getMetricValue(city: CommuneIndex, metric: MetricKey): number {
  return n(city[metric], 0);
}

function getYieldDisplay(city: CommuneIndex): string {
  const y = city.apartmentYield ?? city.houseYield;
  return y != null ? fmt.pct(y) : '—';
}

function countActive(f: MapFilters): number {
  return [
    f.region !== '',
    f.department !== '',
    f.minGlobalScore > 0,
    f.minCashflowScore > 0,
    f.minPatrimonialScore > 0,
    f.minYieldScore > 0,
    f.minRentalDemandScore > 0,
    f.minPrice > 0,
    f.maxPrice > 0,
    f.minYield > 0,
    f.maxYield > 0,
    f.minPopulation > 0,
    f.riskLevel !== '',
  ].filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Leaflet type shim (loaded via CDN, no npm package)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any;

function getLeaflet(): LeafletLib {
  return (window as unknown as { L: LeafletLib }).L;
}

// ---------------------------------------------------------------------------
// Metric config
// ---------------------------------------------------------------------------

const METRICS: { key: MetricKey; label: string; invert?: boolean }[] = [
  { key: 'globalScore',       label: 'Score global' },
  { key: 'yieldScore',        label: 'Rendement' },
  { key: 'patrimonialScore',  label: 'Patrimonial' },
  { key: 'rentalDemandScore', label: 'Dem. locative' },
  { key: 'riskScore',         label: 'Risque', invert: true },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-[9px] font-bold uppercase tracking-widest t-muted whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

function SliderRow({
  label, value, min = 0, max, step = 5,
  display, onChange,
}: {
  label: string; value: number; min?: number; max: number; step?: number;
  display: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="label-xs">{label}</span>
        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 h-1.5 cursor-pointer"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MapPage() {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersLayerRef = useRef<any>(null);

  const [cities, setCities] = useState<CommuneIndex[]>([]);
  const [regions, setRegions] = useState<RegionSummary[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMatching, setTotalMatching] = useState(0);

  const [metric, setMetric] = useState<MetricKey>('globalScore');
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [debouncedFilters, setDebouncedFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const isDark = document.documentElement.classList.contains('dark');

  // Debounce 400ms — évite de surcharger l'API à chaque tick de slider
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), 400);
    return () => clearTimeout(t);
  }, [filters]);

  // ---------------------------------------------------------------------------
  // Init map
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const L = getLeaflet();
    const map = L.map(mapContainerRef.current, { center: [46.5, 2.5], zoom: 6, zoomControl: false });

    const osmTile  = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(isDark ? darkTile : osmTile, {
      attribution: isDark
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributeurs',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch regions + departments once
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchRegions().then(setRegions).catch(() => undefined);
    fetchDepartments().then(setDepartments).catch(() => undefined);
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch cities (debouncedFilters)
  // ---------------------------------------------------------------------------

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const f = debouncedFilters;
      const hasGeoFilter = !!(f.region || f.department);

      const baseParams: Parameters<typeof fetchCitiesPage>[0] = {
        limit: 200,
        sortBy: 'globalScore',
        sortOrder: 'desc',
        dataQuality: DEFAULT_QUALITY,
      };

      // API-side filters
      if (f.region)               baseParams.region = f.region;
      if (f.department)           baseParams.department = f.department;
      if (f.minGlobalScore > 0)   baseParams.minGlobalScore = f.minGlobalScore;
      if (f.minCashflowScore > 0) baseParams.minCashflowScore = f.minCashflowScore;
      if (f.minPatrimonialScore > 0) baseParams.minPatrimonialScore = f.minPatrimonialScore;
      if (f.minPrice > 0)         baseParams.minPrice = f.minPrice;
      if (f.maxPrice > 0)         baseParams.maxPrice = f.maxPrice;
      if (f.minYield > 0)         baseParams.minYield = f.minYield;
      if (f.maxYield > 0)         baseParams.maxYield = f.maxYield;
      if (f.minPopulation > 0)    baseParams.minPopulation = f.minPopulation;
      if (f.riskLevel)            baseParams.riskLevel = f.riskLevel;

      const firstPage = await fetchCitiesPage({ ...baseParams, page: 1 });
      setTotalMatching(firstPage.meta.total);

      let allData = firstPage.data;

      if (hasGeoFilter && firstPage.meta.totalPages > 1) {
        const maxPages = Math.min(firstPage.meta.totalPages, 5);
        const extraPages = await Promise.all(
          Array.from({ length: maxPages - 1 }, (_, i) =>
            fetchCitiesPage({ ...baseParams, page: i + 2 })
          )
        );
        allData = allData.concat(extraPages.flatMap((r) => r.data));
      }

      // Client-side filters (scores non exposés par l'API en param)
      if (f.minYieldScore > 0)
        allData = allData.filter((c) => n(c.yieldScore, 0) >= f.minYieldScore);
      if (f.minRentalDemandScore > 0)
        allData = allData.filter((c) => n(c.rentalDemandScore, 0) >= f.minRentalDemandScore);

      setCities(allData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => { void fetchCities(); }, [fetchCities]);

  // ---------------------------------------------------------------------------
  // Update markers
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = getLeaflet();
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const metricCfg = METRICS.find((m) => m.key === metric);
    const invert = metricCfg?.invert ?? false;

    cities.forEach((city) => {
      if (city.lat == null || city.lon == null) return;

      const value = getMetricValue(city, metric);
      const color = scoreToHsl(value, invert);

      const circle = L.circleMarker([city.lat, city.lon], {
        radius: 6,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      const yieldVal = getYieldDisplay(city);
      const scoreVal = Math.round(value);
      const riskColor = city.riskLevel === 'LOW' ? '#d1fae5' : city.riskLevel === 'MEDIUM' ? '#fef3c7' : '#fee2e2';
      const riskTextColor = city.riskLevel === 'LOW' ? '#065f46' : city.riskLevel === 'MEDIUM' ? '#92400e' : '#991b1b';

      circle.bindPopup(
        `<div style="min-width:180px;font-family:system-ui,sans-serif;font-size:13px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:3px;">${city.city}</div>
          <div style="color:#64748b;margin-bottom:8px;font-size:11px;">Dép. ${city.department} — ${city.departmentName}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            <span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">
              Score ${scoreVal}/100
            </span>
            <span style="background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:9999px;font-size:11px;">
              Rdt ${yieldVal}
            </span>
            <span style="background:${riskColor};color:${riskTextColor};padding:2px 8px;border-radius:9999px;font-size:11px;">
              ${riskLabel(city.riskLevel)}
            </span>
          </div>
          <button
            onclick="window.__mapNavigate && window.__mapNavigate('/cities/${city.inseeCode}')"
            style="background:#3b82f6;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;width:100%;font-weight:600;"
          >
            Voir le détail →
          </button>
        </div>`,
        { maxWidth: 240 }
      );

      layer.addLayer(circle);
    });
  }, [cities, metric]);

  // Expose navigate to Leaflet popup buttons
  useEffect(() => {
    (window as unknown as { __mapNavigate?: (path: string) => void }).__mapNavigate = navigate;
    return () => { delete (window as unknown as { __mapNavigate?: (path: string) => void }).__mapNavigate; };
  }, [navigate]);

  // ---------------------------------------------------------------------------
  // Filter helpers
  // ---------------------------------------------------------------------------

  function upd<K extends keyof MapFilters>(key: K, value: MapFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() { setFilters(DEFAULT_FILTERS); }

  const activeCount = countActive(filters);
  const hasActiveFilters = activeCount > 0;

  const visibleDepartments = filters.region
    ? departments.filter((d) => d.regionSlug === filters.region)
    : departments;

  const zoomIn  = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();
  const resetView = () => mapInstanceRef.current?.setView([46.5, 2.5], 6);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="relative w-full h-full flex flex-col" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div ref={mapContainerRef} className="flex-1 w-full" style={{ zIndex: 0 }} />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
          <div className="card flex items-center gap-3 px-5 py-3 shadow-lg">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="t-secondary text-sm font-medium">Chargement des communes…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Filters panel — top left                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute top-3 left-3 z-20" style={{ width: 288 }}>
        <div className="card shadow-lg overflow-hidden">

          {/* Header */}
          <button
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 t-secondary" />
              <span className="text-sm font-semibold t-primary">Filtres</span>
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold">
                  {activeCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={(e) => { e.stopPropagation(); resetFilters(); }}
                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Réinitialiser"
                >
                  <X size={12} className="t-muted" />
                </button>
              )}
              {filtersOpen ? <ChevronUp className="w-4 h-4 t-muted" /> : <ChevronDown className="w-4 h-4 t-muted" />}
            </div>
          </button>

          {/* Body */}
          {filtersOpen && (
            <div
              className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 180px)' }}
            >
              {/* ── GÉOGRAPHIE ── */}
              <SectionTitle label="Géographie" />

              <div>
                <label className="label-xs block mb-1">Région</label>
                <select
                  className="select-base w-full text-xs"
                  value={filters.region}
                  onChange={(e) => { upd('region', e.target.value); upd('department', ''); }}
                >
                  <option value="">Toutes les régions</option>
                  {regions.map((r) => <option key={r.slug} value={r.slug}>{r.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label-xs block mb-1">Département</label>
                <select
                  className="select-base w-full text-xs"
                  value={filters.department}
                  onChange={(e) => upd('department', e.target.value)}
                >
                  <option value="">Tous les départements</option>
                  {visibleDepartments.map((d) => (
                    <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                  ))}
                </select>
              </div>

              {/* ── PRIX & RENDEMENT ── */}
              <SectionTitle label="Prix & Rendement" />

              <SliderRow
                label="Prix m² min"
                value={filters.minPrice}
                max={5000} step={100}
                display={filters.minPrice > 0 ? `≥ ${filters.minPrice.toLocaleString('fr-FR')} €` : 'Tous'}
                onChange={(v) => upd('minPrice', v)}
              />
              <SliderRow
                label="Prix m² max"
                value={filters.maxPrice}
                max={8000} step={100}
                display={filters.maxPrice > 0 ? `≤ ${filters.maxPrice.toLocaleString('fr-FR')} €` : 'Tous'}
                onChange={(v) => upd('maxPrice', v)}
              />
              <SliderRow
                label="Rendement brut min"
                value={filters.minYield}
                max={12} step={0.5}
                display={filters.minYield > 0 ? `≥ ${filters.minYield} %` : 'Tous'}
                onChange={(v) => upd('minYield', v)}
              />
              <SliderRow
                label="Rendement brut max"
                value={filters.maxYield}
                max={15} step={0.5}
                display={filters.maxYield > 0 ? `≤ ${filters.maxYield} %` : 'Tous'}
                onChange={(v) => upd('maxYield', v)}
              />

              {/* ── SCORES ── */}
              <SectionTitle label="Scores" />

              <SliderRow
                label="Score global min"
                value={filters.minGlobalScore}
                max={90} step={5}
                display={filters.minGlobalScore > 0 ? `≥ ${filters.minGlobalScore}` : 'Tous'}
                onChange={(v) => upd('minGlobalScore', v)}
              />
              <SliderRow
                label="Score rendement min"
                value={filters.minYieldScore}
                max={90} step={5}
                display={filters.minYieldScore > 0 ? `≥ ${filters.minYieldScore}` : 'Tous'}
                onChange={(v) => upd('minYieldScore', v)}
              />
              <SliderRow
                label="Score cashflow min"
                value={filters.minCashflowScore}
                max={90} step={5}
                display={filters.minCashflowScore > 0 ? `≥ ${filters.minCashflowScore}` : 'Tous'}
                onChange={(v) => upd('minCashflowScore', v)}
              />
              <SliderRow
                label="Score patrimonial min"
                value={filters.minPatrimonialScore}
                max={90} step={5}
                display={filters.minPatrimonialScore > 0 ? `≥ ${filters.minPatrimonialScore}` : 'Tous'}
                onChange={(v) => upd('minPatrimonialScore', v)}
              />
              <SliderRow
                label="Demande locative min"
                value={filters.minRentalDemandScore}
                max={90} step={5}
                display={filters.minRentalDemandScore > 0 ? `≥ ${filters.minRentalDemandScore}` : 'Tous'}
                onChange={(v) => upd('minRentalDemandScore', v)}
              />

              {/* ── POPULATION ── */}
              <SectionTitle label="Population" />

              <div className="flex gap-1 flex-wrap">
                {([0, 500, 2000, 5000, 50000] as const).map((pop) => (
                  <button
                    key={pop}
                    onClick={() => upd('minPopulation', pop)}
                    className={`flex-1 min-w-0 text-[10px] font-medium py-1.5 rounded-md border transition-colors ${
                      filters.minPopulation === pop
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-transparent t-muted border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pop === 0 ? 'Tous' : pop >= 1000 ? `>${pop / 1000}k` : `>${pop}`}
                  </button>
                ))}
              </div>

              {/* ── RISQUE ── */}
              <SectionTitle label="Risque" />

              <div className="flex gap-1">
                {(['', 'LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => upd('riskLevel', level)}
                    className={`flex-1 text-[10px] font-medium py-1.5 rounded-md border transition-colors ${
                      filters.riskLevel === level
                        ? level === ''     ? 'bg-blue-500 text-white border-blue-500'
                          : level === 'LOW'    ? 'bg-emerald-500 text-white border-emerald-500'
                          : level === 'MEDIUM' ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-red-500 text-white border-red-500'
                        : 'bg-transparent t-muted border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {level === '' ? 'Tous' : level === 'LOW' ? 'Faible' : level === 'MEDIUM' ? 'Moyen' : 'Élevé'}
                  </button>
                ))}
              </div>

              {/* Note qualité */}
              <p className="text-[10px] t-muted bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1.5 rounded">
                ✓ Données fiables (HIGH) uniquement
              </p>

              {hasActiveFilters && (
                <button onClick={resetFilters} className="btn-ghost text-xs w-full py-1.5">
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          )}
        </div>

        {/* Count badge */}
        {!loading && (
          <div className="mt-2 space-y-1.5">
            <div className="card px-3 py-1.5 shadow flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-xs t-secondary">
                {!hasActiveFilters ? (
                  <>
                    <span className="font-semibold t-primary">Top {cities.length}</span>
                    <span className="t-muted"> par score national</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold t-primary">{cities.length}</span>
                    <span className="t-muted"> commune{cities.length > 1 ? 's' : ''} filtrée{cities.length > 1 ? 's' : ''}</span>
                    {totalMatching > cities.length && (
                      <span className="t-muted"> / {totalMatching.toLocaleString('fr-FR')} total</span>
                    )}
                  </>
                )}
              </span>
            </div>
            {!hasActiveFilters && (
              <div className="card px-3 py-1.5 shadow">
                <p className="text-[10px] t-muted leading-tight">
                  Filtrez par région ou département pour afficher toutes les communes
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Custom zoom controls — bottom left                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute bottom-6 left-3 z-20 flex flex-col gap-1">
        <button onClick={zoomIn}  className="w-8 h-8 card shadow flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Zoomer">
          <Plus size={14} className="t-secondary" />
        </button>
        <button onClick={zoomOut} className="w-8 h-8 card shadow flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Dézoomer">
          <Minus size={14} className="t-secondary" />
        </button>
        <button onClick={resetView} className="w-8 h-8 card shadow flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Vue France entière">
          <RotateCcw size={12} className="t-secondary" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Metric selector — top right                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute top-3 right-3 z-20">
        <div className="card shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 t-secondary" />
            <span className="text-xs font-semibold t-secondary uppercase tracking-wide">Colorier par</span>
          </div>
          <div className="flex flex-col py-1">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                className={`text-left text-xs px-3 py-2 transition-colors ${
                  metric === m.key
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                    : 't-secondary hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {m.label}
                {m.invert && <span className="ml-1 text-[10px] t-muted">(inv.)</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Legend — bottom right                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute bottom-6 right-3 z-20">
        <div className="card shadow-lg px-3 py-2.5" style={{ minWidth: 150 }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold t-secondary uppercase tracking-wide">
              {METRICS.find((m) => m.key === metric)?.label ?? 'Score'}
            </span>
          </div>
          <div
            className="h-2.5 rounded-full mb-1.5"
            style={{
              background: METRICS.find((m) => m.key === metric)?.invert
                ? 'linear-gradient(to right, hsl(120,70%,50%), hsl(60,70%,50%), hsl(0,70%,50%))'
                : 'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%))',
            }}
          />
          <div className="flex justify-between mb-2">
            <span className="text-[10px] t-muted">{METRICS.find((m) => m.key === metric)?.invert ? 'Risque faible' : 'Faible'}</span>
            <span className="text-[10px] t-muted">{METRICS.find((m) => m.key === metric)?.invert ? 'Risque élevé' : 'Élevé'}</span>
          </div>
          <div className="flex flex-col gap-0.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {[
              { label: '≥ 80', cls: 'bg-emerald-500' },
              { label: '60–80', cls: 'bg-blue-500' },
              { label: '40–60', cls: 'bg-amber-500' },
              { label: '< 40',  cls: 'bg-red-500' },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cls}`} />
                <span className="text-[11px] t-muted">{label}</span>
              </div>
            ))}
          </div>
          {metric === 'riskScore' && (
            <p className="text-[10px] t-muted italic mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              Score élevé = risque plus faible
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;
