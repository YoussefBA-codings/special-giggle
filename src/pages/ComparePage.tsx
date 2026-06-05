import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  X,
  Loader2,
  TrendingUp,
  TrendingDown,
  BarChart2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Users,
  Home,
  Building2,
  MapPin,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { CommuneIndex } from '../types/api';
import type { City } from '../types/city';
import { fetchCitiesPage, fetchCompareCities, DEFAULT_QUALITY } from '../lib/api';
import { fmt, n } from '../lib/formatters';
import { ProfileBadge, RiskBadge, YieldBadge } from '../components/ui/Badge';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { EmptyState } from '../components/ui/EmptyState';

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const CITY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
const CITY_TAGS = [
  'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
  'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

type RowDefinition = {
  label: string;
  getValue: (c: City) => number | null | undefined;
  render: (c: City, isBest: boolean) => React.ReactNode;
  higherIsBetter: boolean;
};

const TABLE_ROWS: RowDefinition[] = [
  {
    label: 'Score global',
    getValue: (c) => c.investment?.globalScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.globalScore} />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Cashflow',
    getValue: (c) => c.investment?.cashflowScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.cashflowScore} />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Patrimonial',
    getValue: (c) => c.investment?.patrimonialScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.patrimonialScore} />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Débutant',
    getValue: (c) => c.investment?.beginnerScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.beginnerScore} />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Long terme',
    getValue: (c) => c.investment?.longTermScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.longTermScore} />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Risque',
    getValue: (c) => c.investment?.riskScore,
    render: (c) =>
      c.investment?.riskLevel ? (
        <RiskBadge risk={c.investment.riskLevel} small />
      ) : (
        <span className="t-muted text-xs">—</span>
      ),
    higherIsBetter: false,
  },
  {
    label: 'Profil',
    getValue: () => null,
    render: (c) =>
      c.investment?.profile ? (
        <ProfileBadge profile={c.investment.profile} small />
      ) : (
        <span className="t-muted text-xs">—</span>
      ),
    higherIsBetter: true,
  },
  {
    label: 'Rendement appt',
    getValue: (c) => c.prices?.apartment?.grossYield,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <YieldBadge value={c.prices?.apartment?.grossYield} small />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Rendement maison',
    getValue: (c) => c.prices?.house?.grossYield,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <YieldBadge value={c.prices?.house?.grossYield} small />
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Prix appt / m²',
    getValue: (c) => c.prices?.apartment?.average,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.eur(c.prices?.apartment?.average)}
      </span>
    ),
    higherIsBetter: false,
  },
  {
    label: 'Prix maison / m²',
    getValue: (c) => c.prices?.house?.average,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.eur(c.prices?.house?.average)}
      </span>
    ),
    higherIsBetter: false,
  },
  {
    label: 'Loyer appt / m²',
    getValue: (c) => c.prices?.apartment?.rent,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.eur(c.prices?.apartment?.rent)}
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Population',
    getValue: (c) => n(c.population),
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.num(c.population)}
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Vacance',
    getValue: (c) => c.insee?.vacancyRate,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${
          isBest
            ? 'text-emerald-600 dark:text-emerald-400'
            : n(c.insee?.vacancyRate) > 10
              ? 'text-red-600 dark:text-red-400'
              : 't-secondary'
        }`}
      >
        {fmt.pct(c.insee?.vacancyRate)}
      </span>
    ),
    higherIsBetter: false,
  },
  {
    label: 'Part locataires',
    getValue: (c) => c.insee?.tenantShare,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.pct(c.insee?.tenantShare)}
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Revenu médian',
    getValue: (c) => c.insee?.medianIncome,
    render: (c, isBest) => (
      <span
        className={`text-xs font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 't-secondary'}`}
      >
        {fmt.income(c.insee?.medianIncome)}
      </span>
    ),
    higherIsBetter: true,
  },
  {
    label: 'Score transport',
    getValue: (c) => c.investment?.transportScore,
    render: (c, isBest) => (
      <span className={isBest ? 'ring-1 ring-emerald-400 rounded-full' : ''}>
        <ScoreBadge score={c.investment?.transportScore} />
      </span>
    ),
    higherIsBetter: true,
  },
];

function getBestIndex(
  cities: City[],
  row: RowDefinition
): number {
  const values = cities.map((c) => row.getValue(c));
  const valids = values
    .map((v, i) => ({ v: v ?? null, i }))
    .filter(({ v }) => v != null && !isNaN(v as number));
  if (valids.length === 0) return -1;
  if (row.higherIsBetter) {
    return valids.reduce((best, cur) =>
      (cur.v as number) > (best.v as number) ? cur : best
    ).i;
  }
  return valids.reduce((best, cur) =>
    (cur.v as number) < (best.v as number) ? cur : best
  ).i;
}

// --------------------------------------------------------------------------
// Radar chart data builder
// --------------------------------------------------------------------------

function buildRadarData(cities: City[]) {
  const axes = [
    { key: 'cashflow', label: 'Cashflow' },
    { key: 'patrimonial', label: 'Patrimonial' },
    { key: 'beginner', label: 'Débutant' },
    { key: 'yield', label: 'Rendement' },
    { key: 'transport', label: 'Transport' },
    { key: 'longTerm', label: 'Long terme' },
  ];
  return axes.map(({ key, label }) => {
    const row: Record<string, string | number> = { subject: label };
    cities.forEach((c, i) => {
      const inv = c.investment;
      let val = 0;
      switch (key) {
        case 'cashflow':
          val = n(inv?.cashflowScore);
          break;
        case 'patrimonial':
          val = n(inv?.patrimonialScore);
          break;
        case 'beginner':
          val = n(inv?.beginnerScore);
          break;
        case 'yield':
          val = n(inv?.yieldScore);
          break;
        case 'transport':
          val = n(inv?.transportScore);
          break;
        case 'longTerm':
          val = n(inv?.longTermScore);
          break;
      }
      row[`city${i}`] = Math.round(val);
    });
    return row;
  });
}

// --------------------------------------------------------------------------
// Section components
// --------------------------------------------------------------------------

function CityPickerSearch({
  search,
  onSearch,
  searching,
  results,
  onAdd,
  disabled,
}: {
  search: string;
  onSearch: (v: string) => void;
  searching: boolean;
  results: CommuneIndex[];
  onAdd: (city: CommuneIndex) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-muted pointer-events-none" />
        {searching && (
          <Loader2
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 t-muted animate-spin"
          />
        )}
        <input
          type="text"
          placeholder="Rechercher une commune…"
          value={search}
          disabled={disabled}
          onChange={(e) => {
            onSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="input-base w-full pl-8 pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 card shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
          {results.map((city) => (
            <button
              key={city.inseeCode}
              onMouseDown={() => onAdd(city)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={11} className="t-muted shrink-0" />
                <span className="text-sm font-semibold t-primary truncate">
                  {city.city}
                </span>
                <span className="text-xs t-muted shrink-0">
                  {city.postalCode} · Dép. {city.department}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                {city.globalScore != null && (
                  <ScoreBadge score={city.globalScore} size="sm" />
                )}
                <Plus size={14} className="text-blue-500" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RadarSection({ cities }: { cities: City[] }) {
  const dark = isDarkMode();
  const data = buildRadarData(cities);
  const gridColor = dark ? '#1e293b' : '#e2e8f0';
  const tickColor = dark ? '#64748b' : '#94a3b8';

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={15} className="t-muted" />
        <h3 className="label-xs">Radar comparatif</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: tickColor, fontSize: 11 }}
          />
          {cities.map((city, i) => (
            <Radar
              key={city.city + i}
              name={city.city}
              dataKey={`city${i}`}
              stroke={CITY_COLORS[i % CITY_COLORS.length]}
              fill={CITY_COLORS[i % CITY_COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          {cities.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              formatter={(value) => (
                <span style={{ color: dark ? '#94a3b8' : '#64748b' }}>
                  {value}
                </span>
              )}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonTable({
  cities,
  onRemove,
}: {
  cities: City[];
  onRemove: (inseeCode: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
        <BarChart2 size={15} className="t-muted" />
        <span className="label-xs">Tableau comparatif</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-4 py-3 text-left label-xs w-36 text-slate-400 dark:text-slate-500 font-medium">
                Critère
              </th>
              {cities.map((city, i) => (
                <th
                  key={city.geo?.inseeCode ?? city.city}
                  className="px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CITY_COLORS[i] }}
                    />
                    <span className="text-xs font-semibold t-primary truncate max-w-[100px]">
                      {city.city}
                    </span>
                    <button
                      onClick={() => onRemove(city.geo?.inseeCode ?? '')}
                      className="t-muted hover:text-red-500 transition-colors ml-auto shrink-0"
                      title="Retirer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map(({ label, render, getValue, higherIsBetter }, rowIdx) => {
              const bestIdx = getBestIndex(cities, {
                label,
                getValue,
                render,
                higherIsBetter,
              });
              return (
                <tr
                  key={label}
                  className={`border-b border-slate-100 dark:border-slate-900 ${
                    rowIdx % 2 !== 0
                      ? 'bg-slate-50/60 dark:bg-slate-900/20'
                      : ''
                  }`}
                >
                  <td className="px-4 py-2.5 text-xs t-muted font-medium">
                    {label}
                  </td>
                  {cities.map((city, ci) => (
                    <td
                      key={city.geo?.inseeCode ?? city.city}
                      className="px-4 py-2.5"
                    >
                      {render(city, ci === bestIdx)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[10px] t-muted border-t border-slate-100 dark:border-slate-800">
        La meilleure valeur de chaque ligne est mise en avant en vert.
      </p>
    </div>
  );
}

function StrengthsSection({ cities }: { cities: City[] }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="t-muted" />
        <h3 className="label-xs">Points forts &amp; faiblesses</h3>
      </div>
      <div
        className={`grid gap-4 ${
          cities.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : cities.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {cities.map((city, i) => {
          const strengths = city.insights?.strengths?.slice(0, 3) ?? [];
          const weaknesses = city.insights?.weaknesses?.slice(0, 3) ?? [];
          return (
            <div
              key={city.geo?.inseeCode ?? city.city}
              className="elevated rounded-xl p-3 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CITY_COLORS[i] }}
                />
                <span className="text-xs font-bold t-primary truncate">
                  {city.city}
                </span>
              </div>
              {strengths.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    Points forts
                  </p>
                  {strengths.map((s, si) => (
                    <p
                      key={si}
                      className="text-xs t-secondary leading-snug flex items-start gap-1.5"
                    >
                      <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                      {s}
                    </p>
                  ))}
                </div>
              )}
              {weaknesses.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle size={10} />
                    Faiblesses
                  </p>
                  {weaknesses.map((w, wi) => (
                    <p
                      key={wi}
                      className="text-xs t-secondary leading-snug flex items-start gap-1.5"
                    >
                      <span className="text-red-500 mt-0.5 shrink-0">–</span>
                      {w}
                    </p>
                  ))}
                </div>
              )}
              {strengths.length === 0 && weaknesses.length === 0 && (
                <p className="text-xs t-muted">Aucune donnée disponible.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerdictSection({ cities }: { cities: City[] }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={15} className="t-muted" />
        <h3 className="label-xs">Verdict par ville</h3>
      </div>
      <div
        className={`grid gap-4 ${
          cities.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : cities.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {cities.map((city, i) => {
          const verdict =
            city.insights?.shortVerdict ?? city.insights?.verdict ?? null;
          return (
            <div
              key={city.geo?.inseeCode ?? city.city}
              className="elevated rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CITY_COLORS[i] }}
                />
                <span className="text-xs font-bold t-primary truncate">
                  {city.city}
                </span>
                {city.investment?.globalScore != null && (
                  <ScoreBadge
                    score={city.investment.globalScore}
                    size="sm"
                  />
                )}
              </div>
              {verdict ? (
                <p className="text-xs t-secondary leading-relaxed">{verdict}</p>
              ) : (
                <p className="text-xs t-muted italic">
                  Aucun verdict disponible.
                </p>
              )}
              {city.investment?.profile && (
                <div className="mt-2">
                  <ProfileBadge profile={city.investment.profile} small />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CityHeaderCards({
  cities,
  onRemove,
}: {
  cities: City[];
  onRemove: (inseeCode: string) => void;
}) {
  return (
    <div
      className={`grid gap-3 ${
        cities.length === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : cities.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 lg:grid-cols-4'
      }`}
    >
      {cities.map((city, i) => (
        <div
          key={city.geo?.inseeCode ?? city.city}
          className="card p-4 flex flex-col gap-2"
          style={{ borderTop: `3px solid ${CITY_COLORS[i]}` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold t-primary text-sm truncate">{city.city}</p>
              <p className="text-xs t-muted">
                {city.postalCode} · Dép. {city.department}
              </p>
            </div>
            <button
              onClick={() => onRemove(city.geo?.inseeCode ?? '')}
              className="t-muted hover:text-red-500 transition-colors shrink-0 mt-0.5"
              title="Retirer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {city.investment?.globalScore != null && (
              <ScoreBadge score={city.investment.globalScore} label="global" />
            )}
            {city.investment?.riskLevel && (
              <RiskBadge risk={city.investment.riskLevel} small />
            )}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-1">
            <div className="elevated rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <Building2 size={10} className="t-muted shrink-0" />
              <div>
                <p className="text-[9px] t-muted">Appt</p>
                <p className="text-xs font-semibold t-primary">
                  {fmt.eur(city.prices?.apartment?.average)}
                </p>
              </div>
            </div>
            <div className="elevated rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <Home size={10} className="t-muted shrink-0" />
              <div>
                <p className="text-[9px] t-muted">Maison</p>
                <p className="text-xs font-semibold t-primary">
                  {fmt.eur(city.prices?.house?.average)}
                </p>
              </div>
            </div>
            <div className="elevated rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <TrendingUp size={10} className="t-muted shrink-0" />
              <div>
                <p className="text-[9px] t-muted">Rendement</p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {city.prices?.apartment?.grossYield != null
                    ? fmt.pct(city.prices.apartment.grossYield, 1)
                    : '—'}
                </p>
              </div>
            </div>
            <div className="elevated rounded-lg px-2 py-1.5 flex items-center gap-1.5">
              <Users size={10} className="t-muted shrink-0" />
              <div>
                <p className="text-[9px] t-muted">Population</p>
                <p className="text-xs font-semibold t-primary">
                  {fmt.num(city.population)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Main page
// --------------------------------------------------------------------------

export function ComparePage() {
  const [compareList, setCompareList] = useState<CommuneIndex[]>([]);
  const [compareDetails, setCompareDetails] = useState<City[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<CommuneIndex[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced city search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      fetchCitiesPage({
        search: search.trim(),
        limit: 8,
        sortBy: 'globalScore',
        sortOrder: 'desc',
        dataQuality: DEFAULT_QUALITY,
      })
        .then((res) => {
          const filtered = res.data.filter(
            (c) => !compareList.find((cc) => cc.inseeCode === c.inseeCode)
          );
          setResults(filtered);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 300);
  }, [search, compareList]);

  // Fetch full details when compareList changes
  useEffect(() => {
    if (compareList.length === 0) {
      setCompareDetails([]);
      return;
    }
    setLoadingDetails(true);
    fetchCompareCities(compareList.map((c) => c.inseeCode))
      .then((details) => {
        setCompareDetails(details as unknown as City[]);
        setLoadingDetails(false);
      })
      .catch(() => setLoadingDetails(false));
  }, [compareList]);

  function addCity(city: CommuneIndex) {
    if (compareList.length >= 4) return;
    setCompareList((prev) => [...prev, city]);
    setSearch('');
    setResults([]);
  }

  function removeCity(inseeCode: string) {
    setCompareList((prev) => prev.filter((c) => c.inseeCode !== inseeCode));
  }

  const canAddMore = compareList.length < 4;
  const hasDetails = compareDetails.length >= 2;

  return (
    <div className="page-bg min-h-screen">
      <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-lg font-black t-primary">Comparer des villes</h1>
            <p className="text-sm t-muted mt-0.5">
              Analysez jusqu'à 4 communes côte à côte
            </p>
          </div>
          {compareList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs t-muted">
                {compareList.length}/4 ville{compareList.length > 1 ? 's' : ''} sélectionnée{compareList.length > 1 ? 's' : ''}
              </span>
              {compareList.length > 0 && (
                <button
                  onClick={() => setCompareList([])}
                  className="btn-ghost text-xs flex items-center gap-1"
                >
                  <TrendingDown size={12} />
                  Tout effacer
                </button>
              )}
            </div>
          )}
        </div>

        {/* City picker */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search size={13} className="t-muted" />
            <span className="label-xs">
              {canAddMore
                ? `Ajouter une ville (${4 - compareList.length} emplacement${4 - compareList.length > 1 ? 's' : ''} restant${4 - compareList.length > 1 ? 's' : ''})`
                : 'Limite atteinte (4 villes max)'}
            </span>
          </div>

          <CityPickerSearch
            search={search}
            onSearch={setSearch}
            searching={searching}
            results={results}
            onAdd={addCity}
            disabled={!canAddMore}
          />

          {/* Selected cities pills */}
          {compareList.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              {compareList.map((city, i) => (
                <div
                  key={city.inseeCode}
                  className={`flex items-center gap-2 border rounded-full px-3 py-1 text-sm font-medium ${CITY_TAGS[i]}`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CITY_COLORS[i] }}
                  />
                  <span>{city.city}</span>
                  <span className="opacity-60 text-xs">{city.postalCode}</span>
                  <button
                    onClick={() => removeCity(city.inseeCode)}
                    className="hover:opacity-80 transition-opacity ml-0.5"
                    title="Retirer"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loadingDetails && (
          <div className="card p-12 text-center">
            <Loader2 size={24} className="animate-spin t-muted mx-auto" />
            <p className="text-xs t-muted mt-3">Chargement des données complètes…</p>
          </div>
        )}

        {/* Empty state */}
        {!loadingDetails && compareList.length === 0 && (
          <EmptyState
            title="Aucune ville sélectionnée"
            description="Recherchez et ajoutez au moins 2 communes pour démarrer la comparaison."
          />
        )}

        {/* Need at least 2 cities */}
        {!loadingDetails && compareList.length === 1 && (
          <div className="card p-8 text-center">
            <Plus size={24} className="t-muted mx-auto mb-3" />
            <p className="text-sm font-semibold t-primary">
              Ajoutez une deuxième ville
            </p>
            <p className="text-xs t-muted mt-1">
              La comparaison s'affiche à partir de 2 communes.
            </p>
          </div>
        )}

        {/* Comparison content */}
        {!loadingDetails && hasDetails && (
          <>
            {/* City header cards */}
            <CityHeaderCards cities={compareDetails} onRemove={removeCity} />

            {/* Radar */}
            <RadarSection cities={compareDetails} />

            {/* Table */}
            <ComparisonTable cities={compareDetails} onRemove={removeCity} />

            {/* Strengths / Weaknesses */}
            <StrengthsSection cities={compareDetails} />

            {/* Verdicts */}
            <VerdictSection cities={compareDetails} />
          </>
        )}
      </div>
    </div>
  );
}
