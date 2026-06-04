import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { DepartmentStat } from '../../lib/statistics';

interface Props {
  data: DepartmentStat[];
  metric: 'avgGlobalScore' | 'avgAptYield' | 'avgAptPrice' | 'avgVacancy' | 'avgIncome' | 'avgRisk';
  title: string;
  unit?: string;
  colorFn?: (value: number) => string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6'];

function defaultColor(_: number, i: number) {
  return COLORS[i % COLORS.length];
}

export function DepartmentBarChart({ data, metric, title, unit = '', colorFn }: Props) {
  const formatted = data.map((d) => ({
    name: `Dép. ${d.department}`,
    value: parseFloat(d[metric].toFixed(1)),
    count: d.count,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl">
        <p className="font-bold text-slate-100 mb-1">{label}</p>
        <p className="text-slate-300">{payload[0].value}{unit}</p>
      </div>
    );
  };

  return (
    <div className="card p-5">
      <h3 className="label-xs mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formatted} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: '#64748b' }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis tick={{ fontSize: 9, fill: '#64748b' }} unit={unit} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {formatted.map((entry, i) => (
              <Cell
                key={i}
                fill={colorFn ? colorFn(entry.value) : defaultColor(entry.value, i)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
