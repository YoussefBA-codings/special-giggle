import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { City } from '../../types/city';
import { OpportunityCard } from './OpportunityCard';

interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  cities: City[];
  scoreGetter?: (c: City) => number | null;
  onCityClick: (city: City) => void;
  defaultExpanded?: boolean;
  maxVisible?: number;
}

export function OpportunitySection({
  title, subtitle, emoji, cities, scoreGetter,
  onCityClick, defaultExpanded = false, maxVisible = 5,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? cities : cities.slice(0, maxVisible);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {emoji && <span className="text-xl">{emoji}</span>}
          <div className="text-left">
            <h3 className="font-bold text-slate-100 text-sm">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{cities.length}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-slate-800">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((city, i) => (
              <OpportunityCard
                key={city.city + city.postalCode}
                city={city}
                rank={i + 1}
                scoreValue={scoreGetter ? scoreGetter(city) : undefined}
                onClick={onCityClick}
              />
            ))}
          </div>

          {cities.length > maxVisible && (
            <div className="px-4 pb-4 flex justify-center">
              <button
                onClick={() => setShowAll((p) => !p)}
                className="btn-ghost text-xs"
              >
                {showAll ? `Réduire` : `Voir les ${cities.length - maxVisible} autres`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
