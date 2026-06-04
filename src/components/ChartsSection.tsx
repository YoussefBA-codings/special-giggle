import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, Legend,
} from 'recharts';
import type { CityWithScore } from '../types/city';
import { avg } from '../lib/calculations';

interface Props {
  cities: CityWithScore[];
}

const YIELD_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function ChartsSection({ cities }: Props) {
  // Top 15 rendement appartement pour bar chart
  const top15Apt = [...cities]
    .sort((a, b) => b.prices.apartment.grossYield - a.prices.apartment.grossYield)
    .slice(0, 15)
    .map((c) => ({
      name: c.city.length > 10 ? c.city.slice(0, 10) + '…' : c.city,
      fullName: c.city,
      appt: c.prices.apartment.grossYield,
      maison: c.prices.house.grossYield,
    }));

  // Scatter : prix m² vs loyer (appartements)
  const scatterData = cities
    .filter((c) => c.prices.apartment.average > 0 && c.prices.apartment.rent > 0)
    .map((c) => ({
      x: c.prices.apartment.average,
      y: c.prices.apartment.rent,
      name: c.city,
      yield: c.prices.apartment.grossYield,
    }));

  // Rendement moyen par département
  const deptMap = new Map<string, number[]>();
  cities.forEach((c) => {
    if (!deptMap.has(c.department)) deptMap.set(c.department, []);
    deptMap.get(c.department)!.push(c.prices.apartment.grossYield);
  });
  const deptData = Array.from(deptMap.entries())
    .map(([dept, yields]) => ({ dept: `Dép. ${dept}`, yield: parseFloat(avg(yields).toFixed(2)) }))
    .sort((a, b) => b.yield - a.yield);

  // Distribution des rendements (buckets)
  const buckets = [
    { range: '< 2%', count: 0 },
    { range: '2–3%', count: 0 },
    { range: '3–4%', count: 0 },
    { range: '4–5%', count: 0 },
    { range: '5–6%', count: 0 },
    { range: '6–7%', count: 0 },
    { range: '7–8%', count: 0 },
    { range: '8–10%', count: 0 },
    { range: '> 10%', count: 0 },
  ];
  cities.forEach((c) => {
    const y = c.prices.apartment.grossYield;
    if (y < 2) buckets[0].count++;
    else if (y < 3) buckets[1].count++;
    else if (y < 4) buckets[2].count++;
    else if (y < 5) buckets[3].count++;
    else if (y < 6) buckets[4].count++;
    else if (y < 7) buckets[5].count++;
    else if (y < 8) buckets[6].count++;
    else if (y < 10) buckets[7].count++;
    else buckets[8].count++;
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} className="text-slate-600">{p.name} : <strong>{p.value}%</strong></p>
        ))}
      </div>
    );
  };

  const ScatterTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { x: number; y: number; name: string; yield: number } }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-800">{d.name}</p>
        <p className="text-slate-600">Prix : {d.x.toLocaleString('fr-FR')} €/m²</p>
        <p className="text-slate-600">Loyer : {d.y} €/m²/mois</p>
        <p className="text-slate-600">Rdt : {d.yield}%</p>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Visualisations</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Top 15 — Rendement brut appartement vs maison">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top15Apt} margin={{ top: 0, right: 8, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="appt" name="Appartement" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="maison" name="Maison" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Prix m² vs Loyer m² — Appartements">
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="x" type="number" name="Prix m²" unit="€" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
              <YAxis dataKey="y" type="number" name="Loyer" unit="€" tick={{ fontSize: 10 }} />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter data={scatterData} fill="#6366f1">
                {scatterData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.yield >= 7 ? '#10b981' : entry.yield >= 5 ? '#3b82f6' : entry.yield >= 3 ? '#f59e0b' : '#ef4444'}
                    opacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-slate-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />≥7%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />5–7%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />3–5%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />&lt;3%</span>
          </div>
        </ChartCard>

        <ChartCard title="Rendement moyen par département — Appartements">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData} margin={{ top: 0, right: 8, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Rendement moyen']} />
              <Bar dataKey="yield" name="Rendement moyen" radius={[3, 3, 0, 0]}>
                {deptData.map((_, i) => (
                  <Cell key={i} fill={YIELD_COLORS[i % YIELD_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribution des rendements — Appartements">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={buckets} margin={{ top: 0, right: 8, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [`${v} ville${Number(v) > 1 ? 's' : ''}`, 'Nombre de villes']} />
              <Bar dataKey="count" name="Nombre de villes" radius={[3, 3, 0, 0]}>
                {buckets.map((entry, i) => {
                  const y = parseFloat(entry.range);
                  const fill = isNaN(y)
                    ? (entry.range.startsWith('>') ? '#10b981' : '#ef4444')
                    : y >= 7 ? '#10b981' : y >= 5 ? '#3b82f6' : y >= 3 ? '#f59e0b' : '#ef4444';
                  return <Cell key={i} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
