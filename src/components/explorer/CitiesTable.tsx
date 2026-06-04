import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from 'lucide-react';
import type { City } from '../../types/city';
import { fmt, n } from '../../lib/formatters';
import { RiskBadge, YieldBadge, TransportBadge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props { cities: City[]; onCityClick: (city: City) => void; }

type SortKey = 'city' | 'department' | 'globalScore' | 'cashflow' | 'beginner' | 'patrimonial' | 'longTerm' | 'risk' | 'aptYield' | 'houseYield' | 'aptPrice' | 'housePrice' | 'aptRent' | 'vacancy' | 'growth' | 'income' | 'transport' | 'stationDist' | 'population';

interface Column {
  key: SortKey; label: string; className?: string;
  render: (c: City) => React.ReactNode;
  getValue: (c: City) => string | number;
}

const COLUMNS: Column[] = [
  { key: 'city',        label: 'Ville',     render: (c) => <span className="font-semibold t-primary text-xs">{c.city}</span>,                getValue: (c) => c.city },
  { key: 'department',  label: 'Dép.',      className: 'hidden sm:table-cell',
    render: (c) => <span className="bg-slate-100 dark:bg-slate-800 t-secondary px-1.5 py-0.5 rounded text-[10px] font-mono">{c.department}</span>, getValue: (c) => c.department },
  { key: 'globalScore', label: 'Score',     render: (c) => <ScoreBadge score={c.investment?.globalScore} />,  getValue: (c) => n(c.investment?.globalScore) },
  { key: 'cashflow',    label: 'Cashflow',  className: 'hidden md:table-cell', render: (c) => <ScoreBadge score={c.investment?.cashflowScore} />, getValue: (c) => n(c.investment?.cashflowScore) },
  { key: 'beginner',    label: 'Débutant',  className: 'hidden lg:table-cell', render: (c) => <ScoreBadge score={c.investment?.beginnerScore} />, getValue: (c) => n(c.investment?.beginnerScore) },
  { key: 'aptYield',    label: 'Rdt Appt',  render: (c) => <YieldBadge value={c.prices.apartment.grossYield} small />, getValue: (c) => n(c.prices.apartment.grossYield) },
  { key: 'houseYield',  label: 'Rdt Maison',className: 'hidden xl:table-cell', render: (c) => <YieldBadge value={c.prices.house.grossYield} small />, getValue: (c) => n(c.prices.house.grossYield) },
  { key: 'aptPrice',    label: 'Prix Appt', className: 'hidden lg:table-cell', render: (c) => <span className="t-secondary text-xs">{fmt.eur(c.prices.apartment.average)}</span>, getValue: (c) => n(c.prices.apartment.average) },
  { key: 'vacancy',     label: 'Vacance',   className: 'hidden md:table-cell', render: (c) => <span className={`text-xs font-medium ${n(c.insee?.vacancyRate) > 10 ? 'text-red-600 dark:text-red-400' : n(c.insee?.vacancyRate) > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmt.pct(c.insee?.vacancyRate)}</span>, getValue: (c) => n(c.insee?.vacancyRate) },
  { key: 'income',      label: 'Revenu',    className: 'hidden xl:table-cell', render: (c) => <span className="t-secondary text-xs">{c.insee?.medianIncome ? fmt.num(c.insee.medianIncome) + '€' : '—'}</span>, getValue: (c) => n(c.insee?.medianIncome) },
  { key: 'transport',   label: 'Transport', className: 'hidden lg:table-cell', render: (c) => c.transport?.classification ? <TransportBadge classification={c.transport.classification} small /> : <span className="t-muted text-xs">—</span>, getValue: (c) => n(c.transport?.transportScore) },
  { key: 'risk',        label: 'Risque',    className: 'hidden sm:table-cell', render: (c) => c.investment?.riskLevel ? <RiskBadge risk={c.investment.riskLevel} small /> : <span className="t-muted text-xs">—</span>, getValue: (c) => n(c.investment?.riskScore) },
];

const PAGE_SIZE = 30;

export function CitiesTable({ cities, onCityClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('globalScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [cities]);

  const sorted = [...cities].sort((a, b) => {
    const col = COLUMNS.find((c) => c.key === sortKey)!;
    const av = col.getValue(a), bv = col.getValue(b);
    const dir = sortDir === 'asc' ? 1 : -1;
    if (typeof av === 'string') return av.localeCompare(bv as string, 'fr') * dir;
    return ((av as number) - (bv as number)) * dir;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    setPage(1);
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  if (cities.length === 0) {
    return <div className="card p-16 text-center"><p className="t-muted text-sm">Aucune ville ne correspond à vos filtres.</p></div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {COLUMNS.map((col) => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className={`px-3 py-2.5 text-left cursor-pointer hover:t-primary select-none ${col.className ?? ''}`}>
                  <div className="flex items-center gap-1 label-xs">
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === 'asc' ? <ChevronUp size={10} className="text-blue-500" /> : <ChevronDown size={10} className="text-blue-500" />
                      : <ChevronsUpDown size={10} className="text-slate-300 dark:text-slate-700" />}
                  </div>
                </th>
              ))}
              <th className="px-3 py-2.5 label-xs">Source</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((city, i) => (
              <tr key={city.city + city.postalCode} onClick={() => onCityClick(city)}
                className={`border-b border-slate-100 dark:border-slate-900 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/20'}`}>
                {COLUMNS.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 ${col.className ?? ''}`}>{col.render(city)}</td>
                ))}
                <td className="px-3 py-2.5">
                  {city.url && (
                    <a href={city.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="t-muted hover:text-blue-500 transition-colors"><ExternalLink size={12} /></a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <span className="text-xs t-muted">Page {page}/{totalPages} — {sorted.length} villes</span>
          <div className="flex gap-1 flex-wrap">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return <button key={p} onClick={() => setPage(p)} className={`px-2.5 py-1 text-xs border rounded transition-colors ${p === page ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-slate-700 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{p}</button>;
            })}
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">→</button>
          </div>
        </div>
      )}
    </div>
  );
}
