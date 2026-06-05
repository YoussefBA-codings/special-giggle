import { useEffect, useState } from 'react';
import type { CommuneIndex } from '../types/api';
import { fetchCitiesPage, DEFAULT_QUALITY } from '../lib/api';
import { INVESTOR_PROFILES, type InvestorProfile } from '../lib/rankings';
import { OpportunityCard } from '../components/opportunities/OpportunityCard';
import { n } from '../lib/formatters';
import { Loader2 } from 'lucide-react';
import { useNavigate } from '../router';

interface Props { onCityClick?: (inseeCode: string) => void; }

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-900', text: 'text-emerald-700 dark:text-emerald-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-950',       border: 'border-blue-200 dark:border-blue-900',       text: 'text-blue-700 dark:text-blue-400' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950',   border: 'border-violet-200 dark:border-violet-900',   text: 'text-violet-700 dark:text-violet-400' },
  teal:    { bg: 'bg-teal-50 dark:bg-teal-950',       border: 'border-teal-200 dark:border-teal-900',       text: 'text-teal-700 dark:text-teal-400' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950',       border: 'border-rose-200 dark:border-rose-900',       text: 'text-rose-700 dark:text-rose-400' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950',     border: 'border-amber-200 dark:border-amber-900',     text: 'text-amber-700 dark:text-amber-400' },
};

export function InvestorProfilesPage({ onCityClick }: Props) {
  const navigate = useNavigate();
  const handleCityClick = onCityClick ?? ((id: string) => navigate(`/cities/${id}`));
  const [activeProfileId, setActiveProfileId] = useState(INVESTOR_PROFILES[0]?.id ?? '');
  const [citiesMap, setCitiesMap] = useState<Record<string, CommuneIndex[]>>({});
  const [avoidMap, setAvoidMap] = useState<Record<string, CommuneIndex[]>>({});
  const [loading, setLoading] = useState(false);

  const current = INVESTOR_PROFILES.find((p) => p.id === activeProfileId);

  function fetchForProfile(profile: InvestorProfile) {
    if (citiesMap[profile.id]) return; // already loaded
    setLoading(true);
    const params = { ...profile.apiParams, limit: 30, dataQuality: DEFAULT_QUALITY };
    const avoidParams = Object.keys(profile.avoidApiParams).length > 0
      ? { ...profile.avoidApiParams, limit: 10, dataQuality: DEFAULT_QUALITY }
      : null;

    Promise.all([
      fetchCitiesPage(params),
      avoidParams ? fetchCitiesPage(avoidParams) : Promise.resolve(null),
    ])
      .then(([res, avoidRes]) => {
        setCitiesMap((prev) => ({ ...prev, [profile.id]: res.data }));
        setAvoidMap((prev) => ({ ...prev, [profile.id]: avoidRes?.data ?? [] }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    if (current) fetchForProfile(current);
  }, [activeProfileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const profileCities = current ? (citiesMap[current.id] ?? []) : [];
  const avoidCities = current ? (avoidMap[current.id] ?? []) : [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg font-black t-primary mb-1">Profils investisseurs</h2>
        <p className="text-sm t-muted">Chaque profil présente les meilleures communes selon votre stratégie</p>
      </div>

      {/* Mobile: dropdown */}
      <div className="sm:hidden mb-4">
        <select value={activeProfileId} onChange={(e) => setActiveProfileId(e.target.value)} className="input-base w-full">
          {INVESTOR_PROFILES.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
        </select>
      </div>

      <div className="flex gap-4 sm:gap-6">
        {/* Sidebar — desktop */}
        <div className="hidden sm:block w-52 shrink-0 space-y-1.5">
          {INVESTOR_PROFILES.map((profile) => {
            const colors = COLOR_MAP[profile.color] ?? COLOR_MAP.blue;
            const active = activeProfileId === profile.id;
            return (
              <button key={profile.id} onClick={() => setActiveProfileId(profile.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${active ? `${colors.bg} ${colors.border}` : 'card hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{profile.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${active ? colors.text : 't-primary'}`}>{profile.label}</p>
                    <p className="text-[10px] t-muted">{citiesMap[profile.id]?.length ?? '…'} villes</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {current && (() => {
          const colors = COLOR_MAP[current.color] ?? COLOR_MAP.blue;
          return (
            <div className="flex-1 min-w-0 space-y-4 sm:space-y-5">
              <div className={`card p-4 sm:p-5 ${colors.bg} ${colors.border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{current.emoji}</span>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-black ${colors.text}`}>{current.label}</h3>
                    <p className="text-sm t-secondary mt-0.5">{current.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.criteria.map((c) => (
                    <span key={c} className={`text-xs px-2.5 py-1 rounded-full border ${colors.bg} ${colors.border} ${colors.text}`}>✓ {c}</span>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin t-muted" />
                </div>
              )}

              {!loading && (
                <>
                  <div>
                    <h4 className="label-xs mb-3">Top communes recommandées</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {profileCities.slice(0, 12).map((city, i) => (
                        <OpportunityCard key={city.inseeCode} city={city} rank={i + 1}
                          scoreValue={n(city.globalScore)} onClick={handleCityClick} />
                      ))}
                    </div>
                  </div>

                  {avoidCities.length > 0 && (
                    <div>
                      <h4 className="label-xs mb-3 text-red-600 dark:text-red-400">⚠️ Communes à éviter pour ce profil</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {avoidCities.slice(0, 6).map((city) => (
                          <div key={city.inseeCode} onClick={() => handleCityClick(city.inseeCode)}
                            className="card card-hover p-3 border-red-200 dark:border-red-900/30 flex items-center justify-between cursor-pointer">
                            <div>
                              <p className="text-sm font-semibold t-primary">{city.city}</p>
                              <p className="text-[10px] t-muted">Dép. {city.department} · {city.profile}</p>
                            </div>
                            <span className="text-xs text-red-600 dark:text-red-400 font-medium shrink-0 ml-2">{city.riskLevel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
