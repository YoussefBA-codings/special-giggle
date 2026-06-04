import { Brain } from 'lucide-react';
import type { GlobalStats } from '../../lib/statistics';

interface Props { stats: GlobalStats; }

export function SmartSummary({ stats }: Props) {
  if (stats.total === 0) return null;
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-900">
          <Brain size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="font-bold t-primary text-sm">Résumé intelligent</h2>
      </div>
      <div className="space-y-2">
        {stats.smartSummary.map((line, i) => (
          <p key={i} className="text-sm t-secondary leading-relaxed border-l-2 border-blue-400 dark:border-blue-700 pl-3">{line}</p>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Patrimonial', count: stats.countPatrimonial, cls: 'text-violet-600 dark:text-violet-400' },
          { label: 'Cashflow',    count: stats.countCashflow,    cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Débutant',    count: stats.countBeginnerFriendly, cls: 'text-blue-600 dark:text-blue-400' },
          { label: 'Risque faible', count: stats.countLowRisk, cls: 'text-teal-600 dark:text-teal-400' },
        ].map(({ label, count, cls }) => (
          <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700">
            <p className={`text-2xl font-black ${cls}`}>{count}</p>
            <p className="text-xs t-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
