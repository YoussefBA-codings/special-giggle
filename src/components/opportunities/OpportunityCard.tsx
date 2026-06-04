import { ExternalLink, MapPin } from 'lucide-react';
import type { City } from '../../types/city';
import { fmt, n } from '../../lib/formatters';
import { ProfileBadge, RiskBadge, TagBadge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props { city: City; rank: number; scoreValue?: number | null; onClick: (city: City) => void; }

export function OpportunityCard({ city, rank, scoreValue, onClick }: Props) {
  const inv = city.investment;
  const ins = city.insights;
  const apt = city.prices.apartment;
  const house = city.prices.house;
  const bestYield = Math.max(n(apt.grossYield), n(house.grossYield));

  return (
    <div onClick={() => onClick(city)} className="card card-hover p-3 sm:p-4 group">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black t-muted shrink-0">{rank}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <h3 className="font-bold t-primary text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{city.city}</h3>
              <div className="flex items-center gap-1 text-[10px] t-muted mt-0.5">
                <MapPin size={9} /><span>Dép. {city.department} · {city.postalCode}</span>
              </div>
            </div>
            <ScoreBadge score={scoreValue ?? inv?.globalScore} size="md" />
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {inv?.profile && <ProfileBadge profile={inv.profile} small />}
            {inv?.riskLevel && <RiskBadge risk={inv.riskLevel} small />}
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
              <p className="text-[9px] t-muted uppercase tracking-wide">Rendement</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmt.pct(bestYield)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
              <p className="text-[9px] t-muted uppercase tracking-wide">Prix appt</p>
              <p className="text-xs font-bold t-primary">{fmt.eur(apt.average)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center">
              <p className="text-[9px] t-muted uppercase tracking-wide">Vacance</p>
              <p className={`text-xs font-bold ${n(city.insee?.vacancyRate) > 10 ? 'text-red-600 dark:text-red-400' : 't-primary'}`}>{fmt.pct(city.insee?.vacancyRate)}</p>
            </div>
          </div>
          {ins?.shortVerdict && <p className="text-[10px] t-muted leading-relaxed mb-2">{ins.shortVerdict}</p>}
          {(ins?.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">{ins!.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}</div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 text-[10px] t-muted">
              <span>Transport: <span className="t-secondary">{fmt.score(city.transport?.transportScore)}</span></span>
              <span>Revenu: <span className="t-secondary">{city.insee?.medianIncome ? fmt.num(city.insee.medianIncome) + '€' : '—'}</span></span>
            </div>
            {city.url && (
              <a href={city.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="t-muted hover:text-blue-500 transition-colors"><ExternalLink size={12} /></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
