import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { City } from '../../types/city';
import { n } from '../../lib/formatters';

interface Props { cities: City[]; isDark?: boolean; }

export function DistributionChart({ cities, isDark = true }: Props) {
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#64748b' : '#94a3b8';

  const profileCounts = cities.reduce((acc, c) => {
    const p = c.investment?.profile ?? 'DATA_INCOMPLETE';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const profileData = [
    { name: 'Cashflow',   value: profileCounts['CASHFLOW_OPPORTUNITY'] ?? 0, color: '#10b981' },
    { name: 'Débutant',   value: profileCounts['BEGINNER_FRIENDLY'] ?? 0,    color: '#3b82f6' },
    { name: 'Patrimonial',value: profileCounts['PATRIMONIAL_SAFE'] ?? 0,      color: '#8b5cf6' },
    { name: 'Long terme', value: profileCounts['LONG_TERM_POTENTIAL'] ?? 0,   color: '#06b6d4' },
    { name: 'Équilibré',  value: profileCounts['BALANCED_OPPORTUNITY'] ?? 0,  color: '#14b8a6' },
    { name: 'Piège',      value: profileCounts['YIELD_TRAP'] ?? 0,            color: '#ef4444' },
    { name: 'Faible',     value: profileCounts['LOW_INTEREST'] ?? 0,          color: '#94a3b8' },
    { name: 'Incomplet',  value: profileCounts['DATA_INCOMPLETE'] ?? 0,       color: '#64748b' },
  ].filter((d) => d.value > 0);

  const yieldBuckets = [
    { range: '0-3%', min: 0, max: 3, count: 0, color: '#ef4444' },
    { range: '3-5%', min: 3, max: 5, count: 0, color: '#f97316' },
    { range: '5-6%', min: 5, max: 6, count: 0, color: '#f59e0b' },
    { range: '6-7%', min: 6, max: 7, count: 0, color: '#84cc16' },
    { range: '7-8%', min: 7, max: 8, count: 0, color: '#22c55e' },
    { range: '8-10%', min: 8, max: 10, count: 0, color: '#10b981' },
    { range: '>10%', min: 10, max: 999, count: 0, color: '#06b6d4' },
  ];
  cities.forEach((c) => {
    const y = n(c.prices.apartment.grossYield);
    if (y <= 0) return;
    const b = yieldBuckets.find((b) => y >= b.min && y < b.max);
    if (b) b.count++;
  });

  const Tip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs shadow-xl">
        <p className="font-bold t-primary mb-0.5">{label}</p>
        <p className="t-secondary">{payload[0].value} villes</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="card p-4 sm:p-5">
        <h3 className="label-xs mb-4">Distribution des profils</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={profileData} layout="vertical" margin={{ top: 0, right: 20, left: 65, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 9, fill: tickColor }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: tickColor }} width={65} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="value" radius={[0, 3, 3, 0]}>{profileData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card p-4 sm:p-5">
        <h3 className="label-xs mb-4">Distribution des rendements appartement</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={yieldBuckets} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="range" tick={{ fontSize: 10, fill: tickColor }} />
            <YAxis tick={{ fontSize: 9, fill: tickColor }} allowDecimals={false} />
            <Tooltip content={<Tip />} />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>{yieldBuckets.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
