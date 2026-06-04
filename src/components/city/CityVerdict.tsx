import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { City } from '../../types/city';
import { ProfileBadge, RiskBadge, RecoBadge, TagBadge } from '../ui/Badge';

interface Props { city: City; }

export function CityVerdict({ city }: Props) {
  const inv = city.investment;
  const ins = city.insights;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {inv?.profile && <ProfileBadge profile={inv.profile} />}
        {inv?.riskLevel && <RiskBadge risk={inv.riskLevel} />}
        {inv?.recommendation && <RecoBadge reco={inv.recommendation} />}
      </div>

      {ins?.verdict && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <p className="text-xs t-muted uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
            <Info size={12} /> Analyse
          </p>
          <p className="text-sm t-secondary leading-relaxed">{ins.verdict}</p>
          {ins.investorProfile && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">👤 {ins.investorProfile}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {(ins?.strengths ?? []).length > 0 && (
          <div>
            <p className="text-xs text-emerald-700 dark:text-emerald-500 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <CheckCircle2 size={11} /> Points forts
            </p>
            <ul className="space-y-1">
              {ins!.strengths.map((s, i) => (
                <li key={i} className="text-xs t-secondary flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(ins?.weaknesses ?? []).length > 0 && (
          <div>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
              <XCircle size={11} /> Points faibles
            </p>
            <ul className="space-y-1">
              {ins!.weaknesses.map((w, i) => (
                <li key={i} className="text-xs t-secondary flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 shrink-0">•</span>{w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {(ins?.tags ?? []).length > 0 && (
        <div>
          <p className="label-xs mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {ins!.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
        </div>
      )}

      {ins?.contextFlags && (
        <div>
          <p className="label-xs mb-2">Position dans le dataset</p>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(ins.contextFlags).map(([key, value]) => {
              if (!value) return null;
              const labels: Record<string, string> = {
                priceVsDataset: 'Prix', yieldVsDataset: 'Rendement', rentVsDataset: 'Loyer',
                growthVsDataset: 'Croissance', vacancyVsDataset: 'Vacance',
                transportVsDataset: 'Transport', incomeVsDataset: 'Revenu',
              };
              const cls = value === 'top_20' ? 'text-emerald-600 dark:text-emerald-400'
                : value === 'bottom_20' ? 'text-red-600 dark:text-red-400' : 't-muted';
              const icon = value === 'top_20' ? '↑ Top 20%' : value === 'bottom_20' ? '↓ Bas 20%' : '→ Médian';
              return (
                <div key={key} className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1.5">
                  <span className="text-[10px] t-muted">{labels[key] ?? key}</span>
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
