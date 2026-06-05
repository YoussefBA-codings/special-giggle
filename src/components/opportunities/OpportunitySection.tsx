import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { CommuneIndex } from '../../types/api';
import { OpportunityCard } from './OpportunityCard';

interface Props {
  title: string; subtitle?: string; emoji?: string;
  cities: CommuneIndex[]; scoreGetter?: (c: CommuneIndex) => number | null;
  onCityClick: (inseeCode: string) => void;
  defaultExpanded?: boolean; maxVisible?: number;
}

export function OpportunitySection({ title, subtitle, emoji, cities, scoreGetter, onCityClick, defaultExpanded = false, maxVisible = 5 }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? cities : cities.slice(0, maxVisible);

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setExpanded((p) => !p)} className="w-full flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-3 text-left">
          {emoji && <span className="text-xl shrink-0">{emoji}</span>}
          <div>
            <h3 className="font-bold t-primary text-sm">{title}</h3>
            {subtitle && <p className="text-[11px] t-muted mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 t-muted px-2 py-0.5 rounded-full shrink-0">{cities.length}</span>
        </div>
        {expanded ? <ChevronUp size={16} className="t-muted shrink-0" /> : <ChevronDown size={16} className="t-muted shrink-0" />}
      </button>
      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((city, i) => (
              <OpportunityCard
                key={city.inseeCode}
                city={city}
                rank={i + 1}
                scoreValue={scoreGetter ? scoreGetter(city) : undefined}
                onClick={onCityClick}
              />
            ))}
          </div>
          {cities.length > maxVisible && (
            <div className="px-4 pb-4 flex justify-center">
              <button onClick={() => setShowAll((p) => !p)} className="btn-ghost text-xs">
                {showAll ? 'Réduire' : `Voir les ${cities.length - maxVisible} autres`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
