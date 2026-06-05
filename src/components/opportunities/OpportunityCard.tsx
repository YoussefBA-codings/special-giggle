import { ChevronRight, MapPin } from 'lucide-react';
import type { CommuneIndex } from '../../types/api';
import { fmt, n } from '../../lib/formatters';
import { ProfileBadge, RiskBadge, TagBadge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

interface Props { city: CommuneIndex; rank: number; scoreValue?: number | null; onClick: (inseeCode: string) => void; }

export function OpportunityCard({ city, rank, scoreValue, onClick }: Props) {
  const bestYield = Math.max(n(city.apartmentYield), n(city.houseYield));

  return (
    <button
      type="button"
      onClick={() => onClick(city.inseeCode)}
      className="
        card w-full text-left
        hover:border-blue-400 dark:hover:border-blue-600
        hover:shadow-md hover:shadow-blue-500/10
        active:scale-[0.99]
        transition-all duration-150 cursor-pointer
        group
      "
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black t-muted shrink-0">
            {rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div>
                <h3 className="font-bold t-primary text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {city.city}
                </h3>
                <div className="flex items-center gap-1 text-[10px] t-muted mt-0.5">
                  <MapPin size={9} /><span>Dép. {city.department} · {city.postalCode}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ScoreBadge score={scoreValue ?? city.globalScore} size="md" />
                <ChevronRight size={14} className="t-muted group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              {city.profile && <ProfileBadge profile={city.profile} small />}
              {city.riskLevel && <RiskBadge risk={city.riskLevel} small />}
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2 text-center">
                <p className="text-[9px] t-muted uppercase tracking-wide mb-0.5">Rendement</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{bestYield > 0 ? `${bestYield.toFixed(1)}%` : '—'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2 text-center">
                <p className="text-[9px] t-muted uppercase tracking-wide mb-0.5">Prix appt</p>
                <p className="text-xs font-bold t-primary">{fmt.eur(city.apartmentPrice)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2 text-center">
                <p className="text-[9px] t-muted uppercase tracking-wide mb-0.5">Qualité</p>
                <p className="text-xs font-bold t-primary">{city.dataQuality ?? '—'}</p>
              </div>
            </div>

            {city.shortVerdict && (
              <p className="text-[10px] t-muted leading-relaxed mb-2 italic">{city.shortVerdict}</p>
            )}

            {city.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {city.tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] t-muted">Score global : {city.globalScore}/100 · {city.departmentName}</span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Voir le détail →</span>
      </div>
    </button>
  );
}
