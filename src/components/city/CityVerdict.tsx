import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { City } from '../../types/city';
import { ProfileBadge, RiskBadge, RecoBadge, TagBadge } from '../ui/Badge';

interface Props {
  city: City;
}

export function CityVerdict({ city }: Props) {
  const inv = city.investment;
  const ins = city.insights;

  return (
    <div className="space-y-4">
      {/* Quick badges row */}
      <div className="flex flex-wrap gap-2">
        {inv?.profile && <ProfileBadge profile={inv.profile} />}
        {inv?.riskLevel && <RiskBadge risk={inv.riskLevel} />}
        {inv?.recommendation && <RecoBadge reco={inv.recommendation} />}
      </div>

      {/* Verdict text */}
      {ins?.verdict && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
            <Info size={12} /> Analyse
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{ins.verdict}</p>
          {ins.investorProfile && (
            <p className="text-xs text-blue-400 mt-2 font-medium">👤 {ins.investorProfile}</p>
          )}
        </div>
      )}

      {/* Strengths & weaknesses */}
      <div className="grid grid-cols-1 gap-3">
        {(ins?.strengths ?? []).length > 0 && (
          <div>
            <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckCircle2 size={11} /> Points forts
            </p>
            <ul className="space-y-1">
              {ins!.strengths.map((s, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(ins?.weaknesses ?? []).length > 0 && (
          <div>
            <p className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <XCircle size={11} /> Points faibles
            </p>
            <ul className="space-y-1">
              {ins!.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tags */}
      {(ins?.tags ?? []).length > 0 && (
        <div>
          <p className="label-xs mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {ins!.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        </div>
      )}

      {/* Context flags */}
      {ins?.contextFlags && (
        <div>
          <p className="label-xs mb-2">Position relative dans le dataset</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(ins.contextFlags).map(([key, value]) => {
              if (!value) return null;
              const labels: Record<string, string> = {
                priceVsDataset: 'Prix', yieldVsDataset: 'Rendement',
                rentVsDataset: 'Loyer', growthVsDataset: 'Croissance',
                vacancyVsDataset: 'Vacance', transportVsDataset: 'Transport',
                incomeVsDataset: 'Revenu',
              };
              const cls = value === 'top_20' ? 'text-emerald-400' : value === 'bottom_20' ? 'text-red-400' : 'text-slate-400';
              const icon = value === 'top_20' ? '↑ Top 20%' : value === 'bottom_20' ? '↓ Bas 20%' : '→ Médian';
              return (
                <div key={key} className="flex items-center justify-between bg-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] text-slate-500">{labels[key] ?? key}</span>
                  <span className={`text-[10px] font-semibold ${cls}`}>{icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
