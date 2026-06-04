import { Brain } from 'lucide-react';
import type { GlobalStats } from '../../lib/statistics';

interface Props {
  stats: GlobalStats;
}

export function SmartSummary({ stats }: Props) {
  if (stats.total === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-blue-950 border border-blue-900">
          <Brain size={16} className="text-blue-400" />
        </div>
        <h2 className="font-bold text-slate-100 text-sm">Résumé intelligent</h2>
      </div>
      <div className="space-y-2">
        {stats.smartSummary.map((line, i) => (
          <p key={i} className="text-sm text-slate-300 leading-relaxed border-l-2 border-blue-800 pl-3">
            {line}
          </p>
        ))}
      </div>

      {/* Quick profiles row */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Patrimonial', count: stats.countPatrimonial, color: 'violet' },
          { label: 'Cashflow', count: stats.countCashflow, color: 'emerald' },
          { label: 'Débutant', count: stats.countBeginnerFriendly, color: 'blue' },
          { label: 'Risque faible', count: stats.countLowRisk, color: 'teal' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-slate-800 rounded-lg p-3 text-center border border-slate-700">
            <p className={`text-2xl font-black text-${color}-400`}>{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
