import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import type { CommuneIndex } from '../../types/api';
import { fmt, n } from '../../lib/formatters';
import { RiskBadge, YieldBadge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props {
  cities: CommuneIndex[];
  total: number;
  page: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSortChange: (key: string, dir: 'asc' | 'desc') => void;
  onCityClick: (inseeCode: string) => void;
}

type SortKey = 'city' | 'globalScore' | 'cashflowScore' | 'beginnerScore' | 'patrimonialScore' | 'riskScore' | 'apartmentYield' | 'houseYield' | 'apartmentPrice' | 'population';

interface Column {
  key: SortKey;
  label: string;
  title: string;
  className?: string;
  render: (c: CommuneIndex) => React.ReactNode;
}

const COLUMNS: Column[] = [
  {
    key: 'city', label: 'Ville', title: 'Nom de la commune', className: '',
    render: (c) => (
      <div>
        <span className="font-semibold t-primary text-xs">{c.city}</span>
        <span className="text-[10px] t-muted ml-1.5 hidden sm:inline">Dép. {c.department}</span>
      </div>
    ),
  },
  {
    key: 'globalScore', label: 'Note', title: 'Note globale /100', className: '',
    render: (c) => <ScoreBadge score={c.globalScore} />,
  },
  {
    key: 'cashflowScore', label: 'Cashflow', title: 'Score rentabilité locative /100', className: 'hidden md:table-cell',
    render: (c) => <ScoreBadge score={c.cashflowScore} />,
  },
  {
    key: 'beginnerScore', label: 'Débutants', title: 'Score accessibilité débutants /100', className: 'hidden lg:table-cell',
    render: (c) => <ScoreBadge score={c.beginnerScore} />,
  },
  {
    key: 'apartmentYield', label: 'Rdt appt', title: 'Rendement brut appartement', className: '',
    render: (c) => <YieldBadge value={c.apartmentYield} small />,
  },
  {
    key: 'houseYield', label: 'Rdt maison', title: 'Rendement brut maison', className: 'hidden xl:table-cell',
    render: (c) => <YieldBadge value={c.houseYield} small />,
  },
  {
    key: 'apartmentPrice', label: 'Prix appt', title: 'Prix moyen appartement au m²', className: 'hidden lg:table-cell',
    render: (c) => <span className="t-secondary text-xs">{fmt.eur(c.apartmentPrice)}</span>,
  },
  {
    key: 'population', label: 'Population', title: 'Population de la commune', className: 'hidden xl:table-cell',
    render: (c) => <span className="t-secondary text-xs">{fmt.num(c.population)}</span>,
  },
  {
    key: 'riskScore', label: 'Risque', title: 'Niveau de risque', className: 'hidden sm:table-cell',
    render: (c) => c.riskLevel ? <RiskBadge risk={c.riskLevel} small /> : <span className="t-muted text-xs">—</span>,
  },
];

export function CitiesTable({ cities, total, page, totalPages, sortBy, sortOrder, onPageChange, onSortChange, onCityClick }: Props) {
  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      onSortChange(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'desc');
    }
  }

  if (cities.length === 0) {
    return <div className="card p-16 text-center"><p className="t-muted text-sm">Aucune ville ne correspond à vos filtres.</p></div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <span className="text-[10px] t-muted">Cliquez sur une ligne pour voir le détail · {total.toLocaleString('fr-FR')} commune{total > 1 ? 's' : ''} au total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  title={`Trier par : ${col.title}`}
                  className={`px-3 py-2.5 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 select-none transition-colors ${col.className ?? ''}`}
                >
                  <div className="flex items-center gap-1 label-xs">
                    {col.label}
                    {sortBy === col.key
                      ? sortOrder === 'asc'
                        ? <ChevronUp size={10} className="text-blue-500 shrink-0" />
                        : <ChevronDown size={10} className="text-blue-500 shrink-0" />
                      : <ChevronsUpDown size={10} className="text-slate-300 dark:text-slate-700 shrink-0" />
                    }
                  </div>
                </th>
              ))}
              <th className="px-3 py-2.5 label-xs" />
            </tr>
          </thead>
          <tbody>
            {cities.map((city, i) => (
              <tr
                key={city.inseeCode}
                onClick={() => onCityClick(city.inseeCode)}
                className={`
                  border-b border-slate-100 dark:border-slate-900 cursor-pointer
                  hover:bg-blue-50 dark:hover:bg-blue-950/30
                  hover:border-blue-100 dark:hover:border-blue-900
                  active:bg-blue-100 dark:active:bg-blue-950/50
                  transition-colors group
                  ${i % 2 === 0 ? '' : 'bg-slate-50/40 dark:bg-slate-900/20'}
                `}
                title="Cliquer pour voir le détail"
              >
                {COLUMNS.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 ${col.className ?? ''}`}>
                    {col.render(city)}
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <ChevronRight size={13} className="t-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <span className="text-xs t-muted">Page {page}/{totalPages}</span>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ← Précédent
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => onPageChange(p)}
                  className={`px-2.5 py-1 text-xs border rounded transition-colors ${p === page ? 'bg-blue-600 border-blue-600 text-white font-semibold' : 'border-slate-300 dark:border-slate-700 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {p}
                </button>
              );
            })}
            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-2.5 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded disabled:opacity-30 t-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Expose sort value for a given key so parent can pass the right API param
export function sortKeyToApiParam(key: string): string {
  return key; // API param names match column keys directly
}

