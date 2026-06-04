import { X } from 'lucide-react';
import type { City } from '../../types/city';
import { ScoreRadar } from '../city/ScoreRadar';
import { fmt, n } from '../../lib/formatters';
import { ProfileBadge, RiskBadge, YieldBadge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props { cities: City[]; onRemove: (city: City) => void; }
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const ROWS: { label: string; getValue: (c: City) => React.ReactNode }[] = [
  { label: 'Score global',  getValue: (c) => <ScoreBadge score={c.investment?.globalScore} /> },
  { label: 'Cashflow',      getValue: (c) => <ScoreBadge score={c.investment?.cashflowScore} /> },
  { label: 'Débutant',      getValue: (c) => <ScoreBadge score={c.investment?.beginnerScore} /> },
  { label: 'Patrimonial',   getValue: (c) => <ScoreBadge score={c.investment?.patrimonialScore} /> },
  { label: 'Long terme',    getValue: (c) => <ScoreBadge score={c.investment?.longTermScore} /> },
  { label: 'Profil',        getValue: (c) => c.investment?.profile ? <ProfileBadge profile={c.investment.profile} small /> : '—' },
  { label: 'Risque',        getValue: (c) => c.investment?.riskLevel ? <RiskBadge risk={c.investment.riskLevel} small /> : '—' },
  { label: 'Rdt appt',      getValue: (c) => <YieldBadge value={c.prices.apartment.grossYield} small /> },
  { label: 'Rdt maison',    getValue: (c) => <YieldBadge value={c.prices.house.grossYield} small /> },
  { label: 'Prix appt',     getValue: (c) => <span className="text-xs t-secondary">{fmt.eur(c.prices.apartment.average)}/m²</span> },
  { label: 'Vacance',       getValue: (c) => <span className={`text-xs font-medium ${n(c.insee?.vacancyRate) > 10 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{fmt.pct(c.insee?.vacancyRate)}</span> },
  { label: 'Croissance',    getValue: (c) => <span className={`text-xs font-medium ${n(c.insee?.populationGrowth6Y) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{fmt.growth(c.insee?.populationGrowth6Y)}</span> },
  { label: 'Revenu médian', getValue: (c) => <span className="text-xs t-secondary">{fmt.income(c.insee?.medianIncome)}</span> },
  { label: 'Transport',     getValue: (c) => <span className="text-xs t-secondary">{fmt.score(c.transport?.transportScore)}</span> },
  { label: 'Gare',          getValue: (c) => <span className="text-xs t-muted">{c.transport?.nearestStation ? `${c.transport.nearestStation.name} (${fmt.km(c.transport.nearestStation.distanceKm)})` : '—'}</span> },
];

export function CompareRadar({ cities, onRemove }: Props) {
  if (cities.length === 0) return null;
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <h3 className="label-xs mb-4">Radar comparatif</h3>
        <ScoreRadar cities={cities} colors={COLORS} isDark={isDark} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-left label-xs w-28">Critère</th>
                {cities.map((city, i) => (
                  <th key={city.city} className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-xs font-semibold t-primary truncate">{city.city}</span>
                      <button onClick={() => onRemove(city)} className="t-muted hover:text-red-500 transition-colors ml-auto shrink-0"><X size={12} /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ label, getValue }, i) => (
                <tr key={label} className={`border-b border-slate-100 dark:border-slate-900 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-900/20'}`}>
                  <td className="px-4 py-2.5 label-xs">{label}</td>
                  {cities.map((city) => (
                    <td key={city.city} className="px-4 py-2.5">{getValue(city)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
