import { TrendingUp, Home, Building2, Banknote, Star, ExternalLink } from 'lucide-react';
import type { CityWithScore } from '../types/city';
import { formatEur, formatPct } from '../lib/calculations';

interface Props {
  cities: CityWithScore[];
  onCityClick: (city: CityWithScore) => void;
}

interface TopListProps {
  title: string;
  icon: React.ReactNode;
  items: { city: CityWithScore; value: string; sub: string }[];
  onCityClick: (city: CityWithScore) => void;
  color: string;
}

function TopList({ title, icon, items, onCityClick, color }: TopListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-2 ${color}`}>
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((item, i) => (
          <div
            key={item.city.city + item.city.postalCode}
            onClick={() => onCityClick(item.city)}
            className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{item.city.city}</p>
              <p className="text-xs text-slate-400">{item.sub}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-slate-900">{item.value}</span>
              <a
                href={item.city.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-300 hover:text-blue-600"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopOpportunities({ cities, onCityClick }: Props) {
  const top10 = <T,>(arr: T[], fn: (item: T) => number) =>
    [...arr].sort((a, b) => fn(b) - fn(a)).slice(0, 10);

  const topAptYield = top10(cities, (c) => c.prices.apartment.grossYield ?? 0).map((c) => ({
    city: c,
    value: formatPct(c.prices.apartment.grossYield),
    sub: `Dép. ${c.department} · ${formatEur(c.prices.apartment.average)}/m²`,
  }));

  const topHouseYield = top10(cities, (c) => c.prices.house.grossYield ?? 0).map((c) => ({
    city: c,
    value: formatPct(c.prices.house.grossYield),
    sub: `Dép. ${c.department} · ${formatEur(c.prices.house.average)}/m²`,
  }));

  const topCheap = top10(cities, (c) => -(c.prices.apartment.average ?? Infinity)).map((c) => ({
    city: c,
    value: formatEur(c.prices.apartment.average) + '/m²',
    sub: `Rdt ${formatPct(c.prices.apartment.grossYield)} · Dép. ${c.department}`,
  }));

  const topRent = top10(cities, (c) => c.prices.all.rent ?? 0).map((c) => ({
    city: c,
    value: formatEur(c.prices.all.rent) + '/m²/mois',
    sub: `Dép. ${c.department} · ${c.postalCode}`,
  }));

  const topScore = top10(cities, (c) => c.scoreApartment).map((c) => ({
    city: c,
    value: `Score ${c.scoreApartment}/100`,
    sub: `Rdt ${formatPct(c.prices.apartment.grossYield)} · ${formatEur(c.prices.apartment.average)}/m²`,
  }));

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">Top opportunités</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <TopList
          title="Top 10 rendement appartement"
          icon={<Building2 size={16} />}
          items={topAptYield}
          onCityClick={onCityClick}
          color="text-blue-700"
        />
        <TopList
          title="Top 10 rendement maison"
          icon={<Home size={16} />}
          items={topHouseYield}
          onCityClick={onCityClick}
          color="text-emerald-700"
        />
        <TopList
          title="Top 10 villes les moins chères"
          icon={<Banknote size={16} />}
          items={topCheap}
          onCityClick={onCityClick}
          color="text-amber-700"
        />
        <TopList
          title="Top 10 meilleurs loyers"
          icon={<TrendingUp size={16} />}
          items={topRent}
          onCityClick={onCityClick}
          color="text-purple-700"
        />
        <TopList
          title="Top 10 score investisseur"
          icon={<Star size={16} />}
          items={topScore}
          onCityClick={onCityClick}
          color="text-rose-700"
        />
      </div>
    </div>
  );
}
