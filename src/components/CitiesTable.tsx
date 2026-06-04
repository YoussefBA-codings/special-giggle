import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import type { CityWithScore, SortConfig, PropertyType } from '../types/city';
import { formatEur, formatPct, getYieldBadge } from '../lib/calculations';

interface Props {
  cities: CityWithScore[];
  propertyView: PropertyType | 'all';
  onCityClick: (city: CityWithScore) => void;
}

const PAGE_SIZE = 25;

type ColumnKey =
  | 'city' | 'department' | 'postalCode'
  | 'aptPrice' | 'aptRent' | 'aptYield'
  | 'housePrice' | 'houseRent' | 'houseYield'
  | 'score';

interface Column {
  key: ColumnKey;
  label: string;
  show: (type: PropertyType | 'all') => boolean;
  className?: string;
}

const COLUMNS: Column[] = [
  { key: 'city', label: 'Ville', show: () => true },
  { key: 'department', label: 'Dép.', show: () => true, className: 'hidden sm:table-cell' },
  { key: 'postalCode', label: 'Code postal', show: () => true, className: 'hidden md:table-cell' },
  { key: 'aptPrice', label: 'Prix appt', show: (t) => t !== 'house', className: 'hidden lg:table-cell' },
  { key: 'aptRent', label: 'Loyer appt', show: (t) => t !== 'house', className: 'hidden xl:table-cell' },
  { key: 'aptYield', label: 'Rdt appt', show: (t) => t !== 'house' },
  { key: 'housePrice', label: 'Prix maison', show: (t) => t !== 'apartment', className: 'hidden lg:table-cell' },
  { key: 'houseRent', label: 'Loyer maison', show: (t) => t !== 'apartment', className: 'hidden xl:table-cell' },
  { key: 'houseYield', label: 'Rdt maison', show: (t) => t !== 'apartment' },
  { key: 'score', label: 'Score', show: () => true },
];

function YieldBadge({ value }: { value: number | null | undefined }) {
  const badge = getYieldBadge(value);
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ color: badge.color, backgroundColor: badge.bg }}
      >
        {badge.label}
      </span>
      <span className="text-slate-700 text-sm font-medium">{formatPct(value)}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-100 text-green-800' :
    score >= 50 ? 'bg-blue-100 text-blue-800' :
    score >= 30 ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-800';

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

function SortIcon({ col, sort }: { col: ColumnKey; sort: SortConfig }) {
  if (sort.key !== col) return <ChevronsUpDown size={12} className="text-slate-300" />;
  return sort.direction === 'asc'
    ? <ChevronUp size={12} className="text-blue-600" />
    : <ChevronDown size={12} className="text-blue-600" />;
}

function getCellValue(city: CityWithScore, key: ColumnKey): string | number {
  switch (key) {
    case 'city': return city.city;
    case 'department': return city.department;
    case 'postalCode': return city.postalCode;
    case 'aptPrice': return city.prices.apartment.average ?? 0;
    case 'aptRent': return city.prices.apartment.rent ?? 0;
    case 'aptYield': return city.prices.apartment.grossYield ?? 0;
    case 'housePrice': return city.prices.house.average ?? 0;
    case 'houseRent': return city.prices.house.rent ?? 0;
    case 'houseYield': return city.prices.house.grossYield ?? 0;
    case 'score': return city.scoreApartment;
  }
}

export function CitiesTable({ cities, propertyView, onCityClick }: Props) {
  const [sort, setSort] = useState<SortConfig>({ key: 'score', direction: 'desc' });
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the city list or view changes
  useEffect(() => {
    setPage(1);
  }, [cities, propertyView]);

  const visibleCols = COLUMNS.filter((c) => c.show(propertyView));

  const sorted = [...cities].sort((a, b) => {
    const av = getCellValue(a, sort.key as ColumnKey);
    const bv = getCellValue(b, sort.key as ColumnKey);
    const dir = sort.direction === 'asc' ? 1 : -1;
    if (typeof av === 'string') return av.localeCompare(bv as string, 'fr') * dir;
    return ((av as number) - (bv as number)) * dir;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: ColumnKey) {
    setPage(1);
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );
  }

  if (cities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
        <p className="text-slate-400 text-sm">Aucune ville ne correspond à vos filtres.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-800 select-none whitespace-nowrap ${col.className ?? ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} sort={sort} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((city, i) => (
              <tr
                key={city.city + city.postalCode}
                onClick={() => onCityClick(city)}
                className={`border-b border-slate-50 cursor-pointer transition-colors hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
              >
                {visibleCols.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                    {col.key === 'city' && (
                      <span className="font-semibold text-slate-900">{city.city}</span>
                    )}
                    {col.key === 'department' && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">{city.department}</span>
                    )}
                    {col.key === 'postalCode' && (
                      <span className="text-slate-500">{city.postalCode}</span>
                    )}
                    {col.key === 'aptPrice' && (
                      <span className="text-slate-700">{formatEur(city.prices.apartment.average)}</span>
                    )}
                    {col.key === 'aptRent' && (
                      <span className="text-slate-700">{formatEur(city.prices.apartment.rent)}/m²</span>
                    )}
                    {col.key === 'aptYield' && <YieldBadge value={city.prices.apartment.grossYield} />}
                    {col.key === 'housePrice' && (
                      <span className="text-slate-700">{formatEur(city.prices.house.average)}</span>
                    )}
                    {col.key === 'houseRent' && (
                      <span className="text-slate-700">{formatEur(city.prices.house.rent)}/m²</span>
                    )}
                    {col.key === 'houseYield' && <YieldBadge value={city.prices.house.grossYield} />}
                    {col.key === 'score' && (
                      <ScoreBadge score={propertyView === 'house' ? city.scoreHouse : city.scoreApartment} />
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <a
                    href={city.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Page {page} sur {totalPages} — {sorted.length} villes
          </span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Précédent
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
