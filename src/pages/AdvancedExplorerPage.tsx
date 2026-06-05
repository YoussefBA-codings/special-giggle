import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronsUpDown,
  RotateCcw,
  Download,
  Search,
  X,
  MapPin,
  TrendingUp,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  Zap,
} from 'lucide-react';
import { useNavigate, useLocation } from '../router';
import { fetchCitiesPage, fetchRegions, fetchDepartments } from '../lib/api';
import type { CitiesParams } from '../lib/api';
import type { CommuneIndex, RegionSummary, DepartmentSummary } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { exportToCSV } from '../lib/export';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { RiskBadge, YieldBadge, ProfileBadge } from '../components/ui/Badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdvancedFilters {
  search: string;
  region: string;
  department: string;
  // Prix
  minPrice: number;
  maxPrice: number;
  minRent: number;
  maxRent: number;
  // Rendement
  minYield: number;
  maxYield: number;
  dataQuality: string[]; // HIGH | MEDIUM | LOW (multi)
  // Investissement
  minGlobalScore: number;
  minCashflowScore: number;
  minPatrimonialScore: number;
  minBeginnerScore: number;
  riskLevel: string[]; // LOW | MEDIUM | HIGH (multi)
  profile: string;
  // Marché locatif
  maxVacancy: number;
  minTenantShare: number;
  // Démographie
  minPopulation: number;
  maxPopulation: number;
  // Sort
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: AdvancedFilters = {
  search: '',
  region: '',
  department: '',
  minPrice: 0,
  maxPrice: 0,
  minRent: 0,
  maxRent: 0,
  minYield: 0,
  maxYield: 0,
  dataQuality: ['HIGH'], // Données fiables par défaut — communes non fiables accessibles via recherche
  minGlobalScore: 0,
  minCashflowScore: 0,
  minPatrimonialScore: 0,
  minBeginnerScore: 0,
  riskLevel: [],
  profile: '',
  maxVacancy: 0,
  minTenantShare: 0,
  minPopulation: 0,
  maxPopulation: 0,
  sortBy: 'globalScore',
  sortOrder: 'desc',
};

interface Preset {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  filters: Partial<AdvancedFilters>;
}

const PRESETS: Preset[] = [
  {
    id: 'cashflow_plus',
    label: 'Cashflow+',
    icon: <Zap size={12} />,
    description: 'Rendement >= 7%, risque faible, cashflow score >= 70, données fiables',
    filters: { minYield: 7, riskLevel: ['LOW'], minCashflowScore: 70, dataQuality: ['HIGH'] },
  },
  {
    id: 'beginner_safe',
    label: 'Débutant sécurisé',
    icon: <ShieldCheck size={12} />,
    description: 'Profil débutant, risque faible, score débutant >= 75, données fiables',
    filters: { profile: 'BEGINNER_FRIENDLY', riskLevel: ['LOW'], minBeginnerScore: 75, dataQuality: ['HIGH'] },
  },
  {
    id: 'patrimonial_premium',
    label: 'Patrimonial Premium',
    icon: <Building2 size={12} />,
    description: 'Profil patrimonial, score patrimonial >= 75, score global >= 65',
    filters: { profile: 'PATRIMONIAL', minPatrimonialScore: 75, minGlobalScore: 65 },
  },
  {
    id: 'high_yield',
    label: 'Rendement Élevé',
    icon: <TrendingUp size={12} />,
    description: 'Rendement >= 8%, score global >= 60',
    filters: { minYield: 8, minGlobalScore: 60 },
  },
  {
    id: 'min_risk',
    label: 'Risque Minimum',
    icon: <ShieldCheck size={12} />,
    description: 'Risque faible, score global >= 50, prix <= 6000 €/m²',
    filters: { riskLevel: ['LOW'], minGlobalScore: 50, maxPrice: 6000 },
  },
  {
    id: 'high_quality_data',
    label: 'Haute Qualité Data',
    icon: <BarChart3 size={12} />,
    description: 'Données HIGH uniquement, score global >= 60',
    filters: { dataQuality: ['HIGH'], minGlobalScore: 60 },
  },
];

const PROFILES = [
  { value: '', label: 'Tous profils' },
  { value: 'BEGINNER_FRIENDLY', label: 'Idéal débutant' },
  { value: 'CASHFLOW_OPPORTUNITY', label: 'Cashflow' },
  { value: 'HIGH_YIELD', label: 'Rendement élevé' },
  { value: 'PATRIMONIAL', label: 'Patrimonial' },
  { value: 'BALANCED_OPPORTUNITY', label: 'Équilibré' },
];

const REGION_PRESETS = [
  { label: 'Île-de-France', slug: 'ile-de-france' },
  { label: 'PACA', slug: 'provence-alpes-cote-d-azur' },
  { label: 'Auvergne-Rhône-Alpes', slug: 'auvergne-rhone-alpes' },
  { label: 'Occitanie', slug: 'occitanie' },
];

type SortKey =
  | 'city'
  | 'globalScore'
  | 'cashflowScore'
  | 'patrimonialScore'
  | 'beginnerScore'
  | 'apartmentYield'
  | 'houseYield'
  | 'apartmentPrice'
  | 'apartmentRent'
  | 'riskScore'
  | 'population';

interface Column {
  key: SortKey;
  label: string;
  title: string;
  className?: string;
  render: (c: CommuneIndex) => React.ReactNode;
}

const COLUMNS: Column[] = [
  {
    key: 'city',
    label: 'Ville',
    title: 'Nom de la commune',
    className: 'min-w-[140px]',
    render: (c) => (
      <div className="flex flex-col">
        <span className="font-semibold t-primary text-xs leading-tight">{c.city}</span>
        <span className="text-[10px] t-muted">{c.postalCode}</span>
      </div>
    ),
  },
  {
    key: 'globalScore',
    label: 'Score',
    title: 'Score global /100',
    className: '',
    render: (c) => <ScoreBadge score={c.globalScore} />,
  },
  {
    key: 'apartmentYield',
    label: 'Rendement',
    title: 'Rendement brut appartement',
    className: '',
    render: (c) => <YieldBadge value={c.apartmentYield} small />,
  },
  {
    key: 'apartmentPrice',
    label: 'Prix',
    title: 'Prix moyen appartement au m²',
    className: 'hidden md:table-cell',
    render: (c) => (
      <span className="t-secondary text-xs">
        {c.apartmentPrice ? `${fmt.eur(c.apartmentPrice)}/m²` : '—'}
      </span>
    ),
  },
  {
    key: 'apartmentRent',
    label: 'Loyer',
    title: 'Loyer moyen appartement au m²',
    className: 'hidden lg:table-cell',
    render: (c) => (
      <span className="t-secondary text-xs">
        {c.apartmentRent ? `${fmt.eur(c.apartmentRent)}/m²` : '—'}
      </span>
    ),
  },
  {
    key: 'cashflowScore',
    label: 'Cashflow',
    title: 'Score cashflow /100',
    className: 'hidden lg:table-cell',
    render: (c) => <ScoreBadge score={c.cashflowScore} size="sm" />,
  },
  {
    key: 'patrimonialScore',
    label: 'Patrimonial',
    title: 'Score patrimonial /100',
    className: 'hidden xl:table-cell',
    render: (c) => <ScoreBadge score={c.patrimonialScore} size="sm" />,
  },
  {
    key: 'riskScore',
    label: 'Risque',
    title: 'Niveau de risque',
    className: 'hidden sm:table-cell',
    render: (c) =>
      c.riskLevel ? <RiskBadge risk={c.riskLevel} small /> : <span className="t-muted text-xs">—</span>,
  },
  {
    key: 'globalScore',
    label: 'Profil',
    title: 'Profil investisseur',
    className: 'hidden xl:table-cell',
    render: (c) =>
      c.profile ? <ProfileBadge profile={c.profile} small /> : <span className="t-muted text-xs">—</span>,
  },
];

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function filtersToSearch(f: AdvancedFilters): string {
  const p = new URLSearchParams();
  if (f.search) p.set('search', f.search);
  if (f.region) p.set('region', f.region);
  if (f.department) p.set('department', f.department);
  if (f.minPrice > 0) p.set('minPrice', String(f.minPrice));
  if (f.maxPrice > 0) p.set('maxPrice', String(f.maxPrice));
  if (f.minRent > 0) p.set('minRent', String(f.minRent));
  if (f.maxRent > 0) p.set('maxRent', String(f.maxRent));
  if (f.minYield > 0) p.set('minYield', String(f.minYield));
  if (f.maxYield > 0) p.set('maxYield', String(f.maxYield));
  if (f.dataQuality.length > 0) p.set('dataQuality', f.dataQuality.join(','));
  if (f.minGlobalScore > 0) p.set('minGlobalScore', String(f.minGlobalScore));
  if (f.minCashflowScore > 0) p.set('minCashflowScore', String(f.minCashflowScore));
  if (f.minPatrimonialScore > 0) p.set('minPatrimonialScore', String(f.minPatrimonialScore));
  if (f.minBeginnerScore > 0) p.set('minBeginnerScore', String(f.minBeginnerScore));
  if (f.riskLevel.length > 0) p.set('riskLevel', f.riskLevel.join(','));
  if (f.profile) p.set('profile', f.profile);
  if (f.maxVacancy > 0) p.set('maxVacancy', String(f.maxVacancy));
  if (f.minTenantShare > 0) p.set('minTenantShare', String(f.minTenantShare));
  if (f.minPopulation > 0) p.set('minPopulation', String(f.minPopulation));
  if (f.maxPopulation > 0) p.set('maxPopulation', String(f.maxPopulation));
  if (f.sortBy && f.sortBy !== 'globalScore') p.set('sortBy', f.sortBy);
  if (f.sortOrder && f.sortOrder !== 'desc') p.set('sortOrder', f.sortOrder);
  return p.toString();
}

function searchToFilters(search: string): AdvancedFilters {
  const p = new URLSearchParams(search);
  const num = (k: string) => {
    const v = p.get(k);
    return v ? parseFloat(v) || 0 : 0;
  };
  const arr = (k: string) => {
    const v = p.get(k);
    return v ? v.split(',').filter(Boolean) : [];
  };
  return {
    search: p.get('search') ?? '',
    region: p.get('region') ?? '',
    department: p.get('department') ?? '',
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    minRent: num('minRent'),
    maxRent: num('maxRent'),
    minYield: num('minYield'),
    maxYield: num('maxYield'),
    dataQuality: arr('dataQuality'),
    minGlobalScore: num('minGlobalScore'),
    minCashflowScore: num('minCashflowScore'),
    minPatrimonialScore: num('minPatrimonialScore'),
    minBeginnerScore: num('minBeginnerScore'),
    riskLevel: arr('riskLevel'),
    profile: p.get('profile') ?? '',
    maxVacancy: num('maxVacancy'),
    minTenantShare: num('minTenantShare'),
    minPopulation: num('minPopulation'),
    maxPopulation: num('maxPopulation'),
    sortBy: p.get('sortBy') ?? 'globalScore',
    sortOrder: (p.get('sortOrder') as 'asc' | 'desc') ?? 'desc',
  };
}

function filtersToApiParams(f: AdvancedFilters, page: number): CitiesParams {
  const p: CitiesParams = {
    sortBy: f.sortBy || 'globalScore',
    sortOrder: f.sortOrder || 'desc',
    page,
    limit: 20,
  };
  if (f.search) p.search = f.search;
  if (f.region) p.region = f.region;
  if (f.department) p.department = f.department;
  if (f.minPrice > 0) p.minPrice = f.minPrice;
  if (f.maxPrice > 0) p.maxPrice = f.maxPrice;
  if (f.minRent > 0) p.minRent = f.minRent;
  if (f.maxRent > 0) p.maxRent = f.maxRent;
  if (f.minYield > 0) p.minYield = f.minYield;
  if (f.maxYield > 0) p.maxYield = f.maxYield;
  if (f.dataQuality.length === 1) p.dataQuality = f.dataQuality[0];
  if (f.minGlobalScore > 0) p.minGlobalScore = f.minGlobalScore;
  if (f.minCashflowScore > 0) p.minCashflowScore = f.minCashflowScore;
  if (f.minPatrimonialScore > 0) p.minPatrimonialScore = f.minPatrimonialScore;
  if (f.minBeginnerScore > 0) p.minBeginnerScore = f.minBeginnerScore;
  if (f.riskLevel.length === 1) p.riskLevel = f.riskLevel[0];
  if (f.profile) p.profile = f.profile;
  if (f.minPopulation > 0) p.minPopulation = f.minPopulation;
  if (f.maxPopulation > 0) p.maxPopulation = f.maxPopulation;
  return p;
}

const DEFAULT_QUALITY_ARRAY = ['HIGH'];

function isDefaultQuality(q: string[]): boolean {
  return q.length === DEFAULT_QUALITY_ARRAY.length && q.every((v) => DEFAULT_QUALITY_ARRAY.includes(v));
}

function hasActive(f: AdvancedFilters): boolean {
  return (
    f.search !== '' ||
    f.region !== '' ||
    f.department !== '' ||
    f.minPrice > 0 ||
    f.maxPrice > 0 ||
    f.minRent > 0 ||
    f.maxRent > 0 ||
    f.minYield > 0 ||
    f.maxYield > 0 ||
    !isDefaultQuality(f.dataQuality) || // default HIGH is NOT "active"
    f.minGlobalScore > 0 ||
    f.minCashflowScore > 0 ||
    f.minPatrimonialScore > 0 ||
    f.minBeginnerScore > 0 ||
    f.riskLevel.length > 0 ||
    f.profile !== '' ||
    f.maxVacancy > 0 ||
    f.minTenantShare > 0 ||
    f.minPopulation > 0 ||
    f.maxPopulation > 0
  );
}

function countActive(f: AdvancedFilters): number {
  let c = 0;
  if (f.search) c++;
  if (f.region) c++;
  if (f.department) c++;
  if (f.minPrice > 0 || f.maxPrice > 0) c++;
  if (f.minRent > 0 || f.maxRent > 0) c++;
  if (f.minYield > 0 || f.maxYield > 0) c++;
  if (f.dataQuality.length > 0) c++;
  if (f.minGlobalScore > 0) c++;
  if (f.minCashflowScore > 0) c++;
  if (f.minPatrimonialScore > 0) c++;
  if (f.minBeginnerScore > 0) c++;
  if (f.riskLevel.length > 0) c++;
  if (f.profile) c++;
  if (f.maxVacancy > 0) c++;
  if (f.minTenantShare > 0) c++;
  if (f.minPopulation > 0 || f.maxPopulation > 0) c++;
  return c;
}

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="label-xs block">{label}</label>
      {children}
    </div>
  );
}

function RangeInputs({
  labelMin,
  labelMax,
  min,
  max,
  step,
  valueMin,
  valueMax,
  placeholderMin,
  placeholderMax,
  onChangeMin,
  onChangeMax,
}: {
  labelMin: string;
  labelMax: string;
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  placeholderMin: string;
  placeholderMax: string;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <Field label={labelMin}>
        <input
          type="number"
          placeholder={placeholderMin}
          value={valueMin || ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChangeMin(parseFloat(e.target.value) || 0)}
          className="input-base w-full text-xs"
        />
      </Field>
      <Field label={labelMax}>
        <input
          type="number"
          placeholder={placeholderMax}
          value={valueMax || ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChangeMax(parseFloat(e.target.value) || 0)}
          className="input-base w-full text-xs"
        />
      </Field>
    </div>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="label-xs">{label}</label>
        <span className="text-[10px] font-semibold t-primary tabular-nums">
          {value > 0 ? `>= ${value}` : 'Tous'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 accent-blue-600 cursor-pointer"
      />
      <div className="flex justify-between text-[9px] t-muted">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string; colorClass: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }
  return (
    <div className="space-y-1.5">
      <label className="label-xs block">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-medium transition-all ${
                checked
                  ? `${opt.colorClass} border-current`
                  : 'bg-transparent border-slate-300 dark:border-slate-700 t-muted hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {checked && (
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AccordionSection({
  id,
  icon,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  badge?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="t-muted">{icon}</span>
          <span className="text-xs font-semibold t-primary">{title}</span>
          {badge != null && badge > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={13} className="t-muted shrink-0" />
        ) : (
          <ChevronDown size={13} className="t-muted shrink-0" />
        )}
      </button>
      {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function AdvancedExplorerPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Parse filters from URL search params
  const [filters, setFilters] = useState<AdvancedFilters>(() => {
    const qs = window.location.search.slice(1);
    return searchToFilters(qs);
  });
  const [page, setPage] = useState(1);

  // Results
  const [cities, setCities] = useState<CommuneIndex[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidebar
  const [panelOpen, setPanelOpen] = useState(true);

  // Accordion sections open state
  const [sections, setSections] = useState({
    localisation: true,
    prix: false,
    rendement: false,
    investissement: true,
    marche: false,
    demo: false,
  });

  // Region/dept data for selects
  const [regions, setRegions] = useState<RegionSummary[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);

  // Debounce ref for search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [displaySearch, setDisplaySearch] = useState(filters.search);

  // Load region/dept lists once
  useEffect(() => {
    fetchRegions()
      .then((r) => setRegions(r.sort((a, b) => a.name.localeCompare(b.name, 'fr'))))
      .catch(() => {});
    fetchDepartments()
      .then((d) => setDepartments(d.sort((a, b) => a.code.localeCompare(b.code))))
      .catch(() => {});
  }, []);

  // Sync URL whenever filters or page change
  useEffect(() => {
    const qs = filtersToSearch(filters);
    const url = `/explorer${qs ? `?${qs}` : ''}`;
    // Update URL without reload
    window.history.replaceState(null, '', url);
  }, [filters, page]);

  // Fetch data
  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCitiesPage(filtersToApiParams(filters, page))
      .then((res) => {
        setCities(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [filters, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update a filter key (resets page to 1)
  function setFilter<K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  // Debounced search
  function handleSearchChange(value: string) {
    setDisplaySearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilter('search', value);
    }, 300);
  }

  function applyPreset(preset: Preset) {
    setFilters({ ...DEFAULT_FILTERS, ...preset.filters });
    setDisplaySearch('');
    setPage(1);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setDisplaySearch('');
    setPage(1);
  }

  function handleSort(key: string) {
    setFilters((prev) => ({
      ...prev,
      sortBy: key,
      sortOrder: prev.sortBy === key && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
    setPage(1);
  }

  function toggleSection(key: keyof typeof sections) {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Filtered departments based on selected region
  const filteredDepts = filters.region
    ? departments.filter((d) => d.regionSlug === filters.region)
    : departments;

  const activeCount = countActive(filters);
  const active = hasActive(filters);

  // Badge counts per section
  const locBadge =
    (filters.search ? 1 : 0) + (filters.region ? 1 : 0) + (filters.department ? 1 : 0);
  const prixBadge =
    (filters.minPrice > 0 || filters.maxPrice > 0 ? 1 : 0) +
    (filters.minRent > 0 || filters.maxRent > 0 ? 1 : 0);
  const rendBadge =
    (filters.minYield > 0 || filters.maxYield > 0 ? 1 : 0) + filters.dataQuality.length;
  const investBadge =
    (filters.minGlobalScore > 0 ? 1 : 0) +
    (filters.minCashflowScore > 0 ? 1 : 0) +
    (filters.minPatrimonialScore > 0 ? 1 : 0) +
    (filters.minBeginnerScore > 0 ? 1 : 0) +
    (filters.riskLevel.length > 0 ? 1 : 0) +
    (filters.profile ? 1 : 0);
  const marcheBadge = (filters.maxVacancy > 0 ? 1 : 0) + (filters.minTenantShare > 0 ? 1 : 0);
  const demoBadge = filters.minPopulation > 0 || filters.maxPopulation > 0 ? 1 : 0;

  return (
    <div className="flex h-full">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT PANEL                                                          */}
      {/* ------------------------------------------------------------------ */}
      <aside
        className={`
          sidebar-bg border-r border-slate-200 dark:border-slate-800 flex flex-col
          transition-all duration-200 shrink-0 overflow-hidden
          ${panelOpen ? 'w-72 min-w-[288px]' : 'w-0 min-w-0'}
        `}
        aria-label="Panneau de filtres avancés"
      >
        {panelOpen && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="t-muted" />
                <span className="text-xs font-bold t-primary">Filtres avancés</span>
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                    {activeCount}
                  </span>
                )}
              </div>
              {active && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                >
                  <RotateCcw size={10} />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Presets */}
            <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <p className="label-xs mb-2">Préréglages recommandés</p>
              <div className="flex flex-col gap-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    title={preset.description}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors text-left group"
                  >
                    <span className="t-muted group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {preset.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold t-primary">{preset.label}</span>
                      <p className="text-[10px] t-muted leading-tight truncate">{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable filter sections */}
            <div className="flex-1 overflow-y-auto">
              {/* LOCALISATION */}
              <AccordionSection
                id="localisation"
                icon={<MapPin size={12} />}
                title="Localisation"
                badge={locBadge}
                open={sections.localisation}
                onToggle={() => toggleSection('localisation')}
              >
                <div className="space-y-2.5">
                  {/* Search */}
                  <div className="relative">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Ville, INSEE, code postal…"
                      value={displaySearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="input-base w-full pl-7 pr-7 text-xs"
                    />
                    {displaySearch && (
                      <button
                        type="button"
                        onClick={() => { setDisplaySearch(''); setFilter('search', ''); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 t-muted hover:t-primary transition-colors"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>

                  {/* Région */}
                  <Field label="Région">
                    <select
                      value={filters.region}
                      onChange={(e) => {
                        setFilter('region', e.target.value);
                        if (!e.target.value) setFilter('department', '');
                      }}
                      className="select-base w-full text-xs"
                    >
                      <option value="">Toutes les régions</option>
                      {regions.map((r) => (
                        <option key={r.slug} value={r.slug}>{r.name}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Département */}
                  <Field label="Département">
                    <select
                      value={filters.department}
                      onChange={(e) => setFilter('department', e.target.value)}
                      className="select-base w-full text-xs"
                    >
                      <option value="">Tous les départements</option>
                      {filteredDepts.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} – {d.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* Presets régions rapides */}
                  <div>
                    <p className="label-xs mb-1.5">Accès rapide</p>
                    <div className="flex flex-wrap gap-1">
                      {REGION_PRESETS.map((rp) => (
                        <button
                          key={rp.slug}
                          type="button"
                          onClick={() => {
                            setFilter('region', filters.region === rp.slug ? '' : rp.slug);
                            setFilter('department', '');
                          }}
                          className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                            filters.region === rp.slug
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 dark:border-slate-700 t-secondary hover:border-blue-400 dark:hover:border-blue-700'
                          }`}
                        >
                          {rp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionSection>

              {/* PRIX IMMOBILIER */}
              <AccordionSection
                id="prix"
                icon={<Building2 size={12} />}
                title="Prix immobilier"
                badge={prixBadge}
                open={sections.prix}
                onToggle={() => toggleSection('prix')}
              >
                <div className="space-y-3">
                  <RangeInputs
                    labelMin="Prix min (€/m²)"
                    labelMax="Prix max (€/m²)"
                    min={0}
                    max={20000}
                    step={500}
                    valueMin={filters.minPrice}
                    valueMax={filters.maxPrice}
                    placeholderMin="0"
                    placeholderMax="20 000"
                    onChangeMin={(v) => setFilter('minPrice', v)}
                    onChangeMax={(v) => setFilter('maxPrice', v)}
                  />
                  <RangeInputs
                    labelMin="Loyer min (€/m²)"
                    labelMax="Loyer max (€/m²)"
                    min={0}
                    max={50}
                    step={1}
                    valueMin={filters.minRent}
                    valueMax={filters.maxRent}
                    placeholderMin="0"
                    placeholderMax="50"
                    onChangeMin={(v) => setFilter('minRent', v)}
                    onChangeMax={(v) => setFilter('maxRent', v)}
                  />
                </div>
              </AccordionSection>

              {/* RENDEMENT */}
              <AccordionSection
                id="rendement"
                icon={<TrendingUp size={12} />}
                title="Rendement"
                badge={rendBadge}
                open={sections.rendement}
                onToggle={() => toggleSection('rendement')}
              >
                <div className="space-y-3">
                  <RangeInputs
                    labelMin="Rendement min (%)"
                    labelMax="Rendement max (%)"
                    min={0}
                    max={20}
                    step={0.5}
                    valueMin={filters.minYield}
                    valueMax={filters.maxYield}
                    placeholderMin="0"
                    placeholderMax="20"
                    onChangeMin={(v) => setFilter('minYield', v)}
                    onChangeMax={(v) => setFilter('maxYield', v)}
                  />
                  <CheckboxGroup
                    label="Qualité des données"
                    options={[
                      { value: 'HIGH', label: 'HIGH', colorClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' },
                      { value: 'MEDIUM', label: 'MEDIUM', colorClass: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' },
                      { value: 'LOW', label: 'LOW', colorClass: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' },
                    ]}
                    value={filters.dataQuality}
                    onChange={(v) => setFilter('dataQuality', v)}
                  />
                </div>
              </AccordionSection>

              {/* INVESTISSEMENT */}
              <AccordionSection
                id="investissement"
                icon={<BarChart3 size={12} />}
                title="Investissement"
                badge={investBadge}
                open={sections.investissement}
                onToggle={() => toggleSection('investissement')}
              >
                <div className="space-y-4">
                  <ScoreSlider
                    label="Score global min"
                    value={filters.minGlobalScore}
                    onChange={(v) => setFilter('minGlobalScore', v)}
                  />
                  <ScoreSlider
                    label="Score cashflow min"
                    value={filters.minCashflowScore}
                    onChange={(v) => setFilter('minCashflowScore', v)}
                  />
                  <ScoreSlider
                    label="Score patrimonial min"
                    value={filters.minPatrimonialScore}
                    onChange={(v) => setFilter('minPatrimonialScore', v)}
                  />
                  <ScoreSlider
                    label="Score débutant min"
                    value={filters.minBeginnerScore}
                    onChange={(v) => setFilter('minBeginnerScore', v)}
                  />
                  <CheckboxGroup
                    label="Niveau de risque"
                    options={[
                      { value: 'LOW', label: 'Faible', colorClass: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' },
                      { value: 'MEDIUM', label: 'Modéré', colorClass: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' },
                      { value: 'HIGH', label: 'Élevé', colorClass: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400' },
                    ]}
                    value={filters.riskLevel}
                    onChange={(v) => setFilter('riskLevel', v)}
                  />
                  <Field label="Profil investisseur">
                    <select
                      value={filters.profile}
                      onChange={(e) => setFilter('profile', e.target.value)}
                      className="select-base w-full text-xs"
                    >
                      {PROFILES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </AccordionSection>

              {/* MARCHÉ LOCATIF */}
              <AccordionSection
                id="marche"
                icon={<Zap size={12} />}
                title="Marché locatif"
                badge={marcheBadge}
                open={sections.marche}
                onToggle={() => toggleSection('marche')}
              >
                <div className="space-y-2.5">
                  <Field label="Vacance max (%)">
                    <input
                      type="number"
                      placeholder="Ex: 10"
                      value={filters.maxVacancy || ''}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(e) => setFilter('maxVacancy', parseFloat(e.target.value) || 0)}
                      className="input-base w-full text-xs"
                    />
                  </Field>
                  <Field label="Part locataires min (%)">
                    <input
                      type="number"
                      placeholder="Ex: 40"
                      value={filters.minTenantShare || ''}
                      min={0}
                      max={100}
                      step={1}
                      onChange={(e) => setFilter('minTenantShare', parseFloat(e.target.value) || 0)}
                      className="input-base w-full text-xs"
                    />
                  </Field>
                </div>
              </AccordionSection>

              {/* DÉMOGRAPHIE */}
              <AccordionSection
                id="demo"
                icon={<Users size={12} />}
                title="Démographie"
                badge={demoBadge}
                open={sections.demo}
                onToggle={() => toggleSection('demo')}
              >
                <RangeInputs
                  labelMin="Population min"
                  labelMax="Population max"
                  min={0}
                  max={2000000}
                  step={1000}
                  valueMin={filters.minPopulation}
                  valueMax={filters.maxPopulation}
                  placeholderMin="0"
                  placeholderMax="2 000 000"
                  onChangeMin={(v) => setFilter('minPopulation', v)}
                  onChangeMax={(v) => setFilter('maxPopulation', v)}
                />
              </AccordionSection>
            </div>
          </div>
        )}
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT — Results                                                     */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-800 header-bg flex items-center gap-3 flex-wrap">
          {/* Toggle panel */}
          <button
            type="button"
            onClick={() => setPanelOpen((p) => !p)}
            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-2.5"
            title={panelOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filtres</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 hidden sm:block" />

          {/* Count */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <span className="text-xs t-muted">Chargement…</span>
            ) : error ? (
              <span className="text-xs text-red-500">{error}</span>
            ) : (
              <span className="text-xs t-secondary">
                <span className="font-bold t-primary">{total.toLocaleString('fr-FR')}</span>{' '}
                commune{total !== 1 ? 's' : ''} trouvée{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Active filters chips */}
          {active && !loading && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          )}

          {/* Export */}
          <button
            type="button"
            onClick={() => exportToCSV(cities, `immoinsight-explorer-${Date.now()}.csv`)}
            disabled={cities.length === 0}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 disabled:opacity-40"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>
        </div>

        {/* Table area */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs t-muted">Recherche en cours…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-xs text-red-500">Erreur : {error}</p>
              <button type="button" onClick={fetchData} className="btn-ghost text-xs">
                Réessayer
              </button>
            </div>
          ) : cities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Search size={32} className="t-muted opacity-30" />
              <p className="text-sm font-semibold t-primary">Aucune commune trouvée</p>
              <p className="text-xs t-muted">Modifiez vos critères de recherche.</p>
              {active && (
                <button type="button" onClick={handleReset} className="btn-ghost text-xs flex items-center gap-1.5">
                  <RotateCcw size={11} />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  {COLUMNS.map((col, idx) => {
                    const sortKey = col.key;
                    const isSorted = filters.sortBy === sortKey;
                    return (
                      <th
                        key={`${col.key}-${idx}`}
                        onClick={() => handleSort(sortKey)}
                        className={`px-3 py-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors whitespace-nowrap ${col.className ?? ''}`}
                      >
                        <div className="flex items-center gap-1 label-xs">
                          <span title={col.title}>{col.label}</span>
                          {isSorted ? (
                            filters.sortOrder === 'asc' ? (
                              <ChevronUp size={10} className="text-blue-500 shrink-0" />
                            ) : (
                              <ChevronDown size={10} className="text-blue-500 shrink-0" />
                            )
                          ) : (
                            <ChevronsUpDown size={10} className="text-slate-300 dark:text-slate-700 shrink-0" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody>
                {cities.map((city, i) => (
                  <tr
                    key={city.inseeCode}
                    onClick={() => navigate(`/cities/${city.inseeCode}`)}
                    className={`
                      border-b border-slate-100 dark:border-slate-900 cursor-pointer group
                      hover:bg-blue-50 dark:hover:bg-blue-950/30
                      active:bg-blue-100 dark:active:bg-blue-950/50
                      transition-colors
                      ${i % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-900/20' : ''}
                    `}
                    title={`Voir le détail de ${city.city}`}
                  >
                    {COLUMNS.map((col, idx) => (
                      <td key={`${col.key}-${idx}`} className={`px-3 py-2.5 ${col.className ?? ''}`}>
                        {col.render(city)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <ChevronRight
                        size={13}
                        className="t-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="shrink-0 px-4 py-3 border-t border-slate-200 dark:border-slate-800 header-bg flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs t-muted">
              Page {page} / {totalPages} &mdash; {total.toLocaleString('fr-FR')} communes
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                «
              </button>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ← Préc.
              </button>

              {/* Page numbers */}
              {(() => {
                const start = Math.max(1, Math.min(totalPages - 4, page - 2));
                return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 py-1 text-xs border rounded transition-colors ${
                      p === page
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                        : 'border-slate-300 dark:border-slate-700 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Suiv. →
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
