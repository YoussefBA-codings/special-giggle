import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import type { City } from '../../types/city';
import { n } from '../../lib/formatters';

interface Props { cities: City[]; colors?: string[]; isDark?: boolean; }

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function getRadarData(cities: City[]) {
  const axes = [
    { key: 'global', label: 'Global' }, { key: 'cashflow', label: 'Cashflow' },
    { key: 'beginner', label: 'Débutant' }, { key: 'patrimonial', label: 'Patrimonial' },
    { key: 'longTerm', label: 'Long terme' }, { key: 'safetyInverted', label: 'Sécurité' },
    { key: 'transport', label: 'Transport' }, { key: 'socio', label: 'Socio-éco' },
  ];
  return axes.map(({ key, label }) => {
    const row: Record<string, string | number> = { subject: label };
    cities.forEach((c, i) => {
      const inv = c.investment;
      let val = 0;
      switch (key) {
        case 'global': val = n(inv?.globalScore); break;
        case 'cashflow': val = n(inv?.cashflowScore); break;
        case 'beginner': val = n(inv?.beginnerScore); break;
        case 'patrimonial': val = n(inv?.patrimonialScore); break;
        case 'longTerm': val = n(inv?.longTermScore); break;
        case 'safetyInverted': val = Math.max(0, 100 - n(inv?.riskScore)); break;
        case 'transport': val = n(inv?.transportScore); break;
        case 'socio': val = n(inv?.socioScore); break;
      }
      row[`city${i}`] = Math.round(val);
    });
    return row;
  });
}

export function ScoreRadar({ cities, colors = DEFAULT_COLORS, isDark = true }: Props) {
  if (cities.length === 0) return null;
  const data = getRadarData(cities);
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 11 }} />
        {cities.map((city, i) => (
          <Radar key={city.city + i} name={city.city} dataKey={`city${i}`}
            stroke={colors[i % colors.length]} fill={colors[i % colors.length]} fillOpacity={0.15} strokeWidth={2} />
        ))}
        {cities.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{value}</span>} />
        )}
      </RadarChart>
    </ResponsiveContainer>
  );
}
