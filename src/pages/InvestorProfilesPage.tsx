import { useMemo, useState } from 'react';
import type { City } from '../types/city';
import { getInvestorProfiles } from '../lib/rankings';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { n } from '../lib/formatters';

interface Props {
  cities: City[];
  onCityClick: (city: City) => void;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  emerald: { bg: 'bg-emerald-950', border: 'border-emerald-900', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-950', border: 'border-blue-900', text: 'text-blue-400', dot: 'bg-blue-500' },
  violet: { bg: 'bg-violet-950', border: 'border-violet-900', text: 'text-violet-400', dot: 'bg-violet-500' },
  cyan: { bg: 'bg-cyan-950', border: 'border-cyan-900', text: 'text-cyan-400', dot: 'bg-cyan-500' },
  rose: { bg: 'bg-rose-950', border: 'border-rose-900', text: 'text-rose-400', dot: 'bg-rose-500' },
  amber: { bg: 'bg-amber-950', border: 'border-amber-900', text: 'text-amber-400', dot: 'bg-amber-500' },
};

export function InvestorProfilesPage({ cities, onCityClick }: Props) {
  const profiles = useMemo(() => getInvestorProfiles(cities), [cities]);
  const [activeProfile, setActiveProfile] = useState(profiles[0]?.id ?? '');

  const current = profiles.find((p) => p.id === activeProfile);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-100 mb-1">Profils investisseurs</h2>
        <p className="text-sm text-slate-500">Chaque profil présente les meilleures communes selon votre stratégie</p>
      </div>

      <div className="flex gap-6">
        {/* Profile selector sidebar */}
        <div className="w-56 shrink-0 space-y-1.5">
          {profiles.map((profile) => {
            const colors = COLOR_MAP[profile.color] ?? COLOR_MAP.blue;
            const active = activeProfile === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => setActiveProfile(profile.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${active ? `${colors.bg} ${colors.border}` : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{profile.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${active ? colors.text : 'text-slate-300'}`}>{profile.label}</p>
                    <p className="text-[10px] text-slate-500">{profile.cities.length} villes</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Profile content */}
        {current && (() => {
          const colors = COLOR_MAP[current.color] ?? COLOR_MAP.blue;
          return (
            <div className="flex-1 min-w-0 space-y-5">
              {/* Profile header */}
              <div className={`card p-5 ${colors.bg} border-${current.color}-900`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{current.emoji}</span>
                  <div>
                    <h3 className={`text-xl font-black ${colors.text}`}>{current.label}</h3>
                    <p className="text-sm text-slate-400 mt-0.5">{current.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.criteria.map((c) => (
                    <span key={c} className={`text-xs px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top cities */}
              <div>
                <h4 className="label-xs mb-3">Top {Math.min(30, current.cities.length)} communes recommandées</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {current.cities.slice(0, 12).map((city, i) => (
                    <OpportunityCard
                      key={city.city + city.postalCode}
                      city={city}
                      rank={i + 1}
                      scoreValue={n(city.investment?.globalScore)}
                      onClick={onCityClick}
                    />
                  ))}
                </div>
              </div>

              {/* To avoid */}
              {current.toAvoid.length > 0 && (
                <div>
                  <h4 className="label-xs mb-3 text-red-500">⚠️ Communes à éviter pour ce profil</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {current.toAvoid.slice(0, 6).map((city) => (
                      <div
                        key={city.city}
                        onClick={() => onCityClick(city)}
                        className="card p-3 border-red-900/30 cursor-pointer hover:border-red-800/50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-300">{city.city}</p>
                          <p className="text-[10px] text-slate-500">Dép. {city.department} · {city.investment?.recommendation}</p>
                        </div>
                        <span className="text-xs text-red-400 font-medium">{city.investment?.riskLevel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
