interface Props {
  label: string; value: string; sub?: string;
  icon?: React.ReactNode; accent?: string;
  trend?: number; onClick?: () => void;
}

export function MetricCard({ label, value, sub, icon, accent = 'text-blue-600 dark:text-blue-400', trend, onClick }: Props) {
  return (
    <div onClick={onClick} className={`card p-4 flex items-start gap-3 ${onClick ? 'card-hover' : ''}`}>
      {icon && (
        <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 ${accent}`}>{icon}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="label-xs mb-0.5">{label}</p>
        <p className="text-lg sm:text-xl font-black t-primary leading-tight">{value}</p>
        {sub && <p className="text-xs t-muted mt-0.5 truncate">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-semibold shrink-0 ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
