interface Props {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  accent?: string;
  trend?: number;
  onClick?: () => void;
}

export function MetricCard({ label, value, sub, icon, accent = 'text-blue-400', trend, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`card p-4 flex items-start gap-3 ${onClick ? 'card-hover' : ''}`}
    >
      {icon && (
        <div className={`p-2 rounded-lg bg-slate-800 shrink-0 ${accent}`}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="label-xs mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-semibold shrink-0 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
