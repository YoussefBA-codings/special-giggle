import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { City } from '../../types/city';
import { n } from '../../lib/formatters';

interface Props {
  cities: City[];
  onCityClick?: (city: City) => void;
  xKey?: 'yield' | 'price' | 'vacancy' | 'income';
  yKey?: 'risk' | 'yield' | 'transport' | 'score';
  title?: string;
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981',
  MODERATE: '#f59e0b',
  HIGH: '#f97316',
  VERY_HIGH: '#ef4444',
};

const X_LABELS: Record<string, string> = {
  yield: 'Rendement appt (%)',
  price: 'Prix moyen appt (€/m²)',
  vacancy: 'Vacance (%)',
  income: 'Revenu médian (€)',
};
const Y_LABELS: Record<string, string> = {
  risk: 'Score de risque',
  yield: 'Rendement appt (%)',
  transport: 'Score transport',
  score: 'Score global',
};

export function ScatterYieldRisk({ cities, onCityClick, xKey = 'yield', yKey = 'risk', title }: Props) {
  const data = cities
    .filter((c) => c.investment && c.prices.apartment.grossYield != null)
    .map((c) => ({
      x: xKey === 'yield' ? n(c.prices.apartment.grossYield)
        : xKey === 'price' ? n(c.prices.apartment.average)
        : xKey === 'vacancy' ? n(c.insee?.vacancyRate)
        : n(c.insee?.medianIncome),
      y: yKey === 'risk' ? n(c.investment?.riskScore)
        : yKey === 'yield' ? n(c.prices.apartment.grossYield)
        : yKey === 'transport' ? n(c.transport?.transportScore)
        : n(c.investment?.globalScore),
      risk: c.investment?.riskLevel ?? 'MODERATE',
      name: c.city,
      dept: c.department,
      city: c,
    }))
    .filter((d) => d.x > 0 && d.y > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof data[0] }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-bold text-slate-100 mb-1">{d.name}</p>
        <p className="text-slate-400">Dép. {d.dept}</p>
        <p className="text-slate-300">{X_LABELS[xKey]}: <strong>{d.x.toFixed(1)}</strong></p>
        <p className="text-slate-300">{Y_LABELS[yKey]}: <strong>{d.y.toFixed(0)}</strong></p>
        <p className="text-slate-400">Risque: {d.risk}</p>
      </div>
    );
  };

  return (
    <div className="card p-5">
      {title && <h3 className="label-xs mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x" type="number" name={X_LABELS[xKey]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            label={{ value: X_LABELS[xKey], position: 'insideBottom', offset: -5, fontSize: 10, fill: '#475569' }}
            domain={['auto', 'auto']}
          />
          <YAxis
            dataKey="y" type="number" name={Y_LABELS[yKey]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            label={{ value: Y_LABELS[yKey], angle: -90, position: 'insideLeft', fontSize: 10, fill: '#475569' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            data={data}
            onClick={(d) => { if (d?.city && onCityClick) onCityClick(d.city as City); }}
            cursor={onCityClick ? 'pointer' : 'default'}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={RISK_COLORS[entry.risk] ?? '#6366f1'} opacity={0.75} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2 text-[10px] text-slate-500 flex-wrap">
        {Object.entries(RISK_COLORS).map(([risk, color]) => (
          <span key={risk} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            {risk === 'LOW' ? 'Faible' : risk === 'MODERATE' ? 'Modéré' : risk === 'HIGH' ? 'Élevé' : 'Très élevé'}
          </span>
        ))}
      </div>
    </div>
  );
}
