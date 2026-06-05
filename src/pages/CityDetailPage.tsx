import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Train, Building2, MapPin, Zap, BarChart3 } from 'lucide-react';
import { fetchCityDetail } from '../lib/api';
import type { CommuneDetail } from '../types/api';
import { fmt, n } from '../lib/formatters';
import { scoreBg, scoreColor, riskBg, riskLabel, profileLabel, profileBg, generateCityInsights } from '../lib/insights';
import { useParams, useNavigate } from '../router';

type Tab = 'prices' | 'demography' | 'rental' | 'transport' | 'analysis';

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs t-muted">{label}</span>
        <span className={`text-xs font-bold ${scoreColor(score)}`}>{Math.round(score)}</span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${score>=60?'bg-emerald-500':score>=40?'bg-amber-500':'bg-red-500'}`} style={{width:`${score}%`}} />
      </div>
    </div>
  );
}

function recommendationBadge(rec: string | undefined): { label: string; cls: string } {
  if (!rec) return { label: '', cls: '' };
  if (rec === 'STRONG_OPPORTUNITY') return { label: 'Forte opportunité', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
  if (rec === 'OPPORTUNITY')        return { label: 'Opportunité', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
  if (rec === 'NEUTRAL')            return { label: 'Neutre', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
  if (rec === 'AVOID')              return { label: 'À éviter', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
  return { label: rec, cls: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
}

const CONTEXT_FLAG_LABELS: Record<string, string> = {
  priceVsDataset:     'Prix d\'achat',
  yieldVsDataset:     'Rendement',
  rentVsDataset:      'Loyers',
  growthVsDataset:    'Croissance pop.',
  vacancyVsDataset:   'Vacance locative',
  transportVsDataset: 'Transport',
  incomeVsDataset:    'Revenus médians',
};

const CONTEXT_FLAG_VALUES: Record<string, { label: string; cls: string; note?: string }> = {
  top_20:    { label: 'Top 20%',  cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  top_40:    { label: 'Top 40%',  cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  middle:    { label: 'Médiane',  cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  bottom_40: { label: 'Bas 40%', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  bottom_20: { label: 'Bas 20%', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs t-muted">{label}</span>
      <span className="text-xs font-semibold t-primary text-right">{value ?? '—'}</span>
    </div>
  );
}

export function CityDetailPage() {
  const { inseeCode } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState<CommuneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('prices');

  useEffect(() => {
    if (!inseeCode) return;
    setLoading(true);
    fetchCityDetail(inseeCode).then(setCity as (v: unknown) => void).catch(() => {}).finally(() => setLoading(false));
  }, [inseeCode]);

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48" />
      <div className="card p-5 h-32" />
      <div className="grid grid-cols-7 gap-2">{[...Array(7)].map((_,i) => <div key={i} className="card p-3 h-16" />)}</div>
    </div>
  );
  if (!city) return <div className="p-6 t-muted">Commune introuvable.</div>;

  const inv = city.investment;
  const ins = city.insee;
  const tr = city.transport;
  const apt = city.prices?.apartment;
  const house = city.prices?.house;
  const cityInsights = generateCityInsights(city);

  const SCORES = [
    { label: 'Global', score: n(inv?.globalScore) },
    { label: 'Cashflow', score: n(inv?.cashflowScore) },
    { label: 'Rendement', score: n(inv?.yieldScore) },
    { label: 'Patrimonial', score: n(inv?.patrimonialScore) },
    { label: 'Débutant', score: n(inv?.beginnerScore) },
    { label: 'Risque', score: 100 - n(inv?.riskScore) },
    { label: 'Dem. loc.', score: n(inv?.rentalDemandScore) },
  ];

  const TABS: [Tab, string][] = [
    ['prices', 'Prix & Rendement'],
    ['demography', 'Démographie'],
    ['rental', 'Marché locatif'],
    ['transport', 'Transport'],
    ['analysis', 'Analyse'],
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Back */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1 as unknown as string)} className="btn-ghost text-xs flex items-center gap-1.5">
          <ArrowLeft size={13}/> Retour
        </button>
        {city.department && <>
          <span className="t-muted text-xs">/</span>
          <button onClick={() => navigate(`/departments/${city.department}`)} className="text-xs t-secondary hover:t-primary">Dép. {city.department}</button>
        </>}
      </div>

      {/* Hero */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-black t-primary">{city.city}</h1>
            <p className="text-sm t-muted mt-1">{city.postalCode} · Dép. {city.department} · {city.population?.toLocaleString('fr-FR')} hab.</p>
            {city.insights?.shortVerdict && (
              <p className="text-sm t-secondary mt-2 italic">"{city.insights.shortVerdict}"</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {inv && (() => {
              const rec = recommendationBadge(inv.recommendation);
              return (
                <>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${scoreBg(n(inv.globalScore))}`}>{n(inv.globalScore)}/100</span>
                  {rec.label && <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${rec.cls}`}>{rec.label}</span>}
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${profileBg(inv.profile)}`}>{profileLabel(inv.profile)}</span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${riskBg(inv.riskLevel)}`}>{riskLabel(inv.riskLevel)}</span>
                  {city.insights?.investorProfile && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300">
                      {city.insights.investorProfile}
                    </span>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-5">
          {SCORES.map((s) => (
            <div key={s.label} className="elevated rounded-xl p-2.5 text-center">
              <p className="text-[10px] t-muted mb-1">{s.label}</p>
              <p className={`text-base font-black ${scoreColor(s.score)}`}>{Math.round(s.score)}</p>
              <div className="h-1 bg-slate-300 dark:bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${s.score>=60?'bg-emerald-500':s.score>=40?'bg-amber-500':'bg-red-500'}`} style={{width:`${s.score}%`}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 no-scrollbar">
          {TABS.map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${tab===t?'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400':'t-muted hover:t-primary'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'prices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Appartement */}
                <div className="elevated rounded-xl p-4 space-y-1">
                  <h3 className="font-semibold t-primary flex items-center gap-2 mb-3"><Building2 size={16} className="text-blue-500"/>Appartement</h3>
                  <InfoRow label="Prix moyen" value={fmt.eur(apt?.average) + '/m²'} />
                  <InfoRow label="Fourchette" value={apt ? `${fmt.eur(apt.min)} – ${fmt.eur(apt.max)}/m²` : '—'} />
                  <InfoRow label="Loyer moyen" value={apt ? `${fmt.eur(apt.rent)}/m²/mois` : '—'} />
                  <InfoRow label="Rendement brut" value={<span className={scoreColor(n(apt?.grossYield)*10)}>{fmt.pct(apt?.grossYield, 2)}</span>} />
                </div>
                {/* Maison */}
                <div className="elevated rounded-xl p-4 space-y-1">
                  <h3 className="font-semibold t-primary flex items-center gap-2 mb-3"><Building2 size={16} className="text-purple-500"/>Maison</h3>
                  <InfoRow label="Prix moyen" value={fmt.eur(house?.average) + '/m²'} />
                  <InfoRow label="Fourchette" value={house ? `${fmt.eur(house.min)} – ${fmt.eur(house.max)}/m²` : '—'} />
                  <InfoRow label="Loyer moyen" value={house ? `${fmt.eur(house.rent)}/m²/mois` : '—'} />
                  <InfoRow label="Rendement brut" value={<span className={scoreColor(n(house?.grossYield)*10)}>{fmt.pct(house?.grossYield, 2)}</span>} />
                </div>
              </div>
              {city.priceSources && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${city.priceSources.priceReliabilityIndex.grade === 'A' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : city.priceSources.priceReliabilityIndex.grade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    Grade {city.priceSources.priceReliabilityIndex.grade}
                  </div>
                  <div className="text-xs t-secondary">
                    Fiabilité : {city.priceSources.priceReliabilityIndex.confidence} · Score {city.priceSources.priceReliabilityIndex.score}/100
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${city.priceSources.dataQuality === 'HIGH' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {city.priceSources.dataQuality}
                  </span>
                </div>
              )}
            </div>
          )}

          {tab === 'demography' && ins && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Population', value: ins.population?.toLocaleString('fr-FR') },
                  { label: 'Densité', value: ins.density ? `${Math.round(ins.density)} hab/km²` : '—' },
                  { label: 'Croissance 6 ans', value: <span className={n(ins.populationGrowth6Y) > 0 ? 'text-emerald-600' : 'text-red-600'}>{fmt.growth(ins.populationGrowth6Y)}</span> },
                  { label: 'Revenu médian', value: fmt.income(ins.medianIncome) },
                  { label: 'Score socio-éco.', value: <span className={scoreColor(n(ins.socioEconomicScore))}>{ins.socioEconomicScore}/100</span> },
                  { label: 'Score croissance', value: <span className={scoreColor(n(ins.growthScore))}>{ins.growthScore}/100</span> },
                ].map((s) => (
                  <div key={s.label} className="elevated rounded-xl p-3">
                    <p className="text-xs t-muted mb-1">{s.label}</p>
                    <p className="text-base font-bold t-primary">{s.value || '—'}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs t-muted mb-2">Répartition</p>
                <div className="flex rounded-xl overflow-hidden h-8">
                  <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{width:`${ins.tenantShare ?? 0}%`}}>
                    {ins.tenantShare ? `${Math.round(ins.tenantShare)}% loc.` : ''}
                  </div>
                  <div className="bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-xs font-bold t-primary flex-1">
                    {ins.ownerShare ? `${Math.round(ins.ownerShare)}% prop.` : ''}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'rental' && ins && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Vacance locative', value: ins.vacancyRate, warn: (ins.vacancyRate ?? 0) > 8, format: (v: number) => fmt.pct(v, 1) },
                  { label: 'Part de locataires', value: ins.tenantShare, warn: false, format: (v: number) => fmt.pct(v, 1) },
                  { label: 'Score marché loc.', value: ins.rentalMarketScore, warn: false, format: (v: number) => `${Math.round(v)}/100` },
                ].map((s) => (
                  <div key={s.label} className={`elevated rounded-xl p-3 ${s.warn ? 'border border-amber-300 dark:border-amber-700' : ''}`}>
                    <p className="text-xs t-muted mb-1">{s.label}</p>
                    <p className={`text-base font-bold ${s.warn ? 'text-amber-600' : 't-primary'}`}>{s.value != null ? s.format(s.value) : '—'}</p>
                    {s.warn && <p className="text-[10px] text-amber-600 mt-1">⚠️ Vigilance recommandée</p>}
                  </div>
                ))}
              </div>
              <div className="elevated rounded-xl p-4">
                <p className="text-xs t-muted mb-2">Score demande locative</p>
                <ScoreBar label="" score={n(inv?.rentalDemandScore)} />
              </div>
            </div>
          )}

          {tab === 'transport' && tr && (
            <div className="space-y-4">
              {/* Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="elevated rounded-xl p-3">
                  <p className="text-xs t-muted mb-1">Score transport</p>
                  <p className={`text-lg font-bold ${scoreColor(n(tr.transportScore))}`}>{n(tr.transportScore)}/100</p>
                </div>
                <div className="elevated rounded-xl p-3">
                  <p className="text-xs t-muted mb-1">Score invest. transport</p>
                  <p className={`text-lg font-bold ${scoreColor(n(tr.transportInvestmentScore))}`}>{n(tr.transportInvestmentScore)}/100</p>
                </div>
                <div className="elevated rounded-xl p-3">
                  <p className="text-xs t-muted mb-1">Classification</p>
                  <p className="text-sm font-bold t-primary">{tr.classification || '—'}</p>
                </div>
              </div>

              {/* Modes disponibles + gare la plus proche par type */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Métro',  has: tr.hasMetro, nearest: tr.nearestMetro },
                  { label: 'RER',    has: tr.hasRer,   nearest: tr.nearestRer   },
                  { label: 'Train',  has: tr.hasTrain,  nearest: tr.nearestTrain },
                  { label: 'Tram',   has: tr.hasTram,  nearest: tr.nearestTram  },
                ].map((item) => (
                  <div key={item.label} className={`elevated rounded-xl p-3 ${item.has ? 'border border-emerald-200 dark:border-emerald-800' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Train size={14} className={item.has ? 'text-emerald-500' : 't-muted'} />
                      <span className="text-sm font-medium t-primary">{item.label}</span>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${item.has ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {item.has ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    {item.nearest?.name && (
                      <p className="text-[11px] t-muted truncate">{item.nearest.name} ({item.nearest.distanceKm} km)</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Gare principale + rayon */}
              <div className="elevated rounded-xl p-3 space-y-1">
                {tr.nearestStation?.name && (
                  <InfoRow label="Gare principale" value={`${tr.nearestStation.name} (${tr.nearestStation.distanceKm} km)`} />
                )}
                <InfoRow label="Stations à 2 km"  value={tr.stationsWithin2Km} />
                <InfoRow label="Stations à 5 km"  value={tr.stationsWithin5Km} />
                <InfoRow label="Stations à 10 km" value={tr.stationsWithin10Km} />
              </div>

              {/* Points forts transport */}
              {tr.transportInsights?.strengths && tr.transportInsights.strengths.length > 0 && (
                <div>
                  <p className="label-xs mb-2">Points forts</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tr.transportInsights.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                        <Train size={12} className="shrink-0 mt-0.5" />{s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Points faibles transport */}
              {tr.transportInsights?.weaknesses && tr.transportInsights.weaknesses.length > 0 && (
                <div>
                  <p className="label-xs mb-2">Points faibles</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tr.transportInsights.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                        <MapPin size={12} className="shrink-0 mt-0.5" />{w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Résumé */}
              {tr.transportInsights?.summary && (
                <p className="text-sm t-secondary italic border-l-2 border-slate-300 dark:border-slate-600 pl-3">
                  {tr.transportInsights.summary}
                </p>
              )}

              {/* Projets futurs */}
              {(tr.futureProjects?.grandParis || tr.futureProjects?.newStationPlanned) && (
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="label-xs text-violet-700 dark:text-violet-300 mb-2">Projets à venir</p>
                  {tr.futureProjects?.grandParis && (
                    <p className="text-xs text-violet-700 dark:text-violet-300 flex items-center gap-2">
                      <MapPin size={12} />Ligne Grand Paris Express prévue
                    </p>
                  )}
                  {tr.futureProjects?.newStationPlanned && (
                    <p className="text-xs text-violet-700 dark:text-violet-300 flex items-center gap-2 mt-1">
                      <MapPin size={12} />Nouvelle gare planifiée
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'analysis' && (
            <div className="space-y-4">

              {/* Positionnement vs base nationale */}
              {city.insights?.contextFlags && Object.keys(city.insights.contextFlags).length > 0 && (
                <div>
                  <h3 className="font-semibold t-primary text-sm mb-3 flex items-center gap-2">
                    <BarChart3 size={15} className="text-blue-500"/>
                    Positionnement vs base nationale
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(city.insights.contextFlags).map(([key, val]) => {
                      const flagLabel = CONTEXT_FLAG_LABELS[key];
                      const flagVal = CONTEXT_FLAG_VALUES[val];
                      if (!flagLabel || !flagVal) return null;
                      return (
                        <div key={key} className="elevated rounded-xl p-2.5">
                          <p className="text-[10px] t-muted mb-1">{flagLabel}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${flagVal.cls}`}>{flagVal.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {cityInsights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cityInsights.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Zap size={11}/>{item}
                    </span>
                  ))}
                </div>
              )}

              {city.insights && <>
                {city.insights.strengths?.length > 0 && (
                  <div>
                    <h3 className="font-semibold t-primary text-sm mb-2 flex items-center gap-2"><CheckCircle size={15} className="text-emerald-500"/>Forces</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {city.insights.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                          <CheckCircle size={13} className="shrink-0 mt-0.5"/>{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {city.insights.weaknesses?.length > 0 && (
                  <div>
                    <h3 className="font-semibold t-primary text-sm mb-2 flex items-center gap-2"><XCircle size={15} className="text-red-500"/>Faiblesses</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {city.insights.weaknesses.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-300">
                          <XCircle size={13} className="shrink-0 mt-0.5"/>{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {city.insights.verdict && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs label-xs mb-2">Verdict complet</p>
                    <p className="text-sm t-secondary">{city.insights.verdict}</p>
                  </div>
                )}
                {city.insights.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {city.insights.tags.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full elevated t-secondary">{tag}</span>)}
                  </div>
                )}
              </>}

              {/* Données source */}
              {ins?.dataYear && (
                <p className="text-[11px] t-muted text-center">
                  Sources : pop. {ins.dataYear.population ?? '—'} · revenus {ins.dataYear.income ?? '—'} · logement {ins.dataYear.housing ?? '—'}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => navigate(`/compare`)} className="btn-ghost text-xs border border-slate-200 dark:border-slate-700">Comparer cette ville</button>
                <button onClick={() => navigate(`/explorer?department=${city.department}`)} className="btn-ghost text-xs border border-slate-200 dark:border-slate-700">Villes similaires</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
