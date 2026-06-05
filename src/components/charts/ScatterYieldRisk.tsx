import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CommuneIndex } from '../../types/api';
import { n } from '../../lib/formatters';

interface Props {
  cities: CommuneIndex[]; onCityClick?: (inseeCode: string) => void;
  xKey?: 'yield' | 'price' | 'cashflow' | 'beginner';
  yKey?: 'risk' | 'globalScore' | 'yieldScore' | 'patrimonial';
  title?: string; isDark?: boolean;
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444',
};

const X_LABELS: Record<string, string> = {
  yield: 'Rendement appt (%)',
  price: 'Prix appt (€/m²)',
  cashflow: 'Score cashflow',
  beginner: 'Score débutant',
};
const Y_LABELS: Record<string, string> = {
  risk: 'Score risque',
  globalScore: 'Score global',
  yieldScore: 'Score rendement',
  patrimonial: 'Score patrimonial',
};

export function ScatterYieldRisk({ cities, onCityClick, xKey = 'yield', yKey = 'risk', title, isDark = true }: Props) {
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#64748b' : '#94a3b8';
  const labelColor = isDark ? '#475569' : '#94a3b8';

  const data = cities
    .filter((c) => c.apartmentYield != null)
    .map((c) => ({
      x: xKey === 'yield' ? n(c.apartmentYield)
        : xKey === 'price' ? n(c.apartmentPrice)
        : xKey === 'cashflow' ? n(c.cashflowScore)
        : n(c.beginnerScore),
      y: yKey === 'risk' ? n(c.riskScore)
        : yKey === 'globalScore' ? n(c.globalScore)
        : yKey === 'yieldScore' ? n(c.yieldScore)
        : n(c.patrimonialScore),
      risk: c.riskLevel ?? 'MEDIUM',
      name: c.city,
      dept: c.department,
      inseeCode: c.inseeCode,
    }))
    .filter((d) => d.x > 0 && d.y > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof data[0] }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-bold t-primary mb-1">{d.name}</p>
        <p className="t-muted">Dép. {d.dept}</p>
        <p className="t-secondary">{X_LABELS[xKey]}: <strong>{d.x.toFixed(1)}</strong></p>
        <p className="t-secondary">{Y_LABELS[yKey]}: <strong>{d.y.toFixed(0)}</strong></p>
      </div>
    );
  };

  return (
    <div className="card p-4 sm:p-5">
      {title && <h3 className="label-xs mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="x" type="number" tick={{ fontSize: 10, fill: tickColor }} label={{ value: X_LABELS[xKey], position: 'insideBottom', offset: -10, fontSize: 10, fill: labelColor }} domain={['auto', 'auto']} />
          <YAxis dataKey="y" type="number" tick={{ fontSize: 10, fill: tickColor }} label={{ value: Y_LABELS[yKey], angle: -90, position: 'insideLeft', fontSize: 10, fill: labelColor }} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={data}
            onClick={(d) => { if (d?.inseeCode && onCityClick) onCityClick(d.inseeCode as string); }}
            cursor={onCityClick ? 'pointer' : 'default'}
          >
            {data.map((entry, i) => <Cell key={i} fill={RISK_COLORS[entry.risk] ?? '#6366f1'} opacity={0.75} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2 text-[10px] t-muted flex-wrap">
        {Object.entries(RISK_COLORS).map(([risk, color]) => (
          <span key={risk} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {risk === 'LOW' ? 'Faible' : risk === 'MEDIUM' ? 'Modéré' : 'Élevé'}
          </span>
        ))}
      </div>
    </div>
  );
}
