import { Building2, Home, TrendingUp, Banknote, Star, MapPin } from 'lucide-react';
import type { CityWithScore } from '../types/city';
import { avg, formatEur, formatPct } from '../lib/calculations';

interface Props {
  cities: CityWithScore[];
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`p-2.5 rounded-lg ${accent ?? 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsCards({ cities }: Props) {
  if (cities.length === 0) return null;

  const avgAptYield = avg(cities.map((c) => c.prices.apartment.grossYield));
  const avgHouseYield = avg(cities.map((c) => c.prices.house.grossYield));
  const avgAptPrice = avg(cities.map((c) => c.prices.apartment.average));
  const avgHousePrice = avg(cities.map((c) => c.prices.house.average));
  const avgRent = avg(cities.map((c) => c.prices.all.rent));

  const bestApt = cities.reduce((best, c) =>
    c.prices.apartment.grossYield > best.prices.apartment.grossYield ? c : best,
  );
  const bestHouse = cities.reduce((best, c) =>
    c.prices.house.grossYield > best.prices.house.grossYield ? c : best,
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        icon={<MapPin size={20} />}
        label="Villes analysées"
        value={cities.length.toString()}
        sub="Île-de-France"
        accent="bg-slate-100 text-slate-600"
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        label="Rendement moyen appt"
        value={formatPct(avgAptYield)}
        sub="brut annuel"
        accent="bg-green-50 text-green-600"
      />
      <StatCard
        icon={<TrendingUp size={20} />}
        label="Rendement moyen maison"
        value={formatPct(avgHouseYield)}
        sub="brut annuel"
        accent="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        icon={<Building2 size={20} />}
        label="Prix moyen appt"
        value={formatEur(avgAptPrice) + '/m²'}
        accent="bg-blue-50 text-blue-600"
      />
      <StatCard
        icon={<Home size={20} />}
        label="Prix moyen maison"
        value={formatEur(avgHousePrice) + '/m²'}
        accent="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        icon={<Banknote size={20} />}
        label="Loyer moyen"
        value={formatEur(avgRent) + '/m²/mois'}
        accent="bg-amber-50 text-amber-600"
      />
      <StatCard
        icon={<Star size={20} />}
        label="Top appt"
        value={formatPct(bestApt.prices.apartment.grossYield)}
        sub={bestApt.city}
        accent="bg-purple-50 text-purple-600"
      />
      <StatCard
        icon={<Star size={20} />}
        label="Top maison"
        value={formatPct(bestHouse.prices.house.grossYield)}
        sub={bestHouse.city}
        accent="bg-rose-50 text-rose-600"
      />
    </div>
  );
}
