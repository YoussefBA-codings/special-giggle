import { useEffect, useState, useCallback } from 'react';
import {
  X,
  ExternalLink,
  Building2,
  Home,
  Train,
  TrendingUp,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import type { CommuneDetail } from '../../lib/api';
import { fetchCityDetail } from '../../lib/api';
import { fmt, n } from '../../lib/formatters';
import { ProfileBadge, RiskBadge, YieldBadge, TransportBadge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreBadge';
import { useNavigate } from '../../router';
import { SkeletonLine, SkeletonCard } from '../ui/Skeleton';

interface Props {
  inseeCode: string | null;
  onClose: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreColor(score: number | null | undefined): string {
  const s = n(score);
  if (s >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (s >= 60) return 'text-blue-600 dark:text-blue-400';
  if (s >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number | null | undefined): string {
  const s = n(score);
  if (s >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (s >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (s >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
}

// ─── sub-components ─────────────────────────────────────────────────────────

function Divider() {
  return <div className="border-t border-slate-100 dark:border-slate-800 my-4" />;
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="t-muted">{icon}</div>
      <h3 className="label-xs font-bold t-secondary uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 items-center text-center">
      <span className="label-xs t-muted">{label}</span>
      <span className="text-sm font-bold t-primary">{value}</span>
      {sub && <span className="text-[10px] t-muted">{sub}</span>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* header skeleton handled outside */}
      <SkeletonCard className="h-24" />
      <SkeletonCard className="h-16" />
      <div className="space-y-2">
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
      </div>
      <SkeletonCard className="h-20" />
      <div className="space-y-2">
        <SkeletonLine className="w-2/3" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function CityDetailsDrawer({ inseeCode, onClose }: Props) {
  const navigate = useNavigate();
  const [city, setCity] = useState<CommuneDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inseeCode) {
      setCity(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchCityDetail(inseeCode)
      .then((data) => {
        setCity(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [inseeCode]);

  const handleNavigate = useCallback(() => {
    if (!inseeCode) return;
    onClose();
    navigate(`/cities/${inseeCode}`);
  }, [inseeCode, navigate, onClose]);

  // Key handler for overlay click trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  if (!inseeCode) return null;

  const inv = city?.investment;
  const ins = city?.insee;
  const tr = city?.transport;
  const apt = city?.prices?.apartment;
  const house = city?.prices?.house;
  const insights = city?.insights;

  // Best price / yield for hero stats
  const bestPrice = apt?.average ?? house?.average ?? null;
  const bestYield = apt?.grossYield ?? house?.grossYield ?? null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={city ? `Détails — ${city.city}` : 'Chargement…'}
        onKeyDown={handleKeyDown}
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="shrink-0 sticky top-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3.5 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            {city ? (
              <>
                <h2 className="text-base sm:text-lg font-black t-primary truncate">{city.city}</h2>
                <p className="text-xs t-muted mt-0.5">
                  Dép.&nbsp;{city.department}
                  {city.postalCode ? ` · ${city.postalCode}` : ''}
                  {city.geo?.inseeCode ? ` · INSEE ${city.geo.inseeCode}` : ''}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {inv?.profile && <ProfileBadge profile={inv.profile} small />}
                  {inv?.riskLevel && <RiskBadge risk={inv.riskLevel} small />}
                </div>
              </>
            ) : loading ? (
              <div className="space-y-2 pt-1">
                <SkeletonLine className="w-40 h-5" />
                <SkeletonLine className="w-28 h-3" />
              </div>
            ) : (
              <p className="text-sm t-muted">Ville inconnue</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-3 mt-0.5">
            {city && (
              <button
                onClick={handleNavigate}
                className="btn-ghost text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg"
                title="Voir page complète"
              >
                Page complète
                <ExternalLink size={12} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg btn-ghost"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {loading && <LoadingSkeleton />}

          {error && !loading && (
            <div className="flex flex-col items-center gap-3 py-20 text-center px-6">
              <AlertCircle size={28} className="text-red-500" />
              <p className="text-sm t-secondary">{error}</p>
              <button
                className="btn-ghost text-xs px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                onClick={() => {
                  if (!inseeCode) return;
                  setLoading(true);
                  setError(null);
                  fetchCityDetail(inseeCode)
                    .then((d) => { setCity(d); setLoading(false); })
                    .catch((e: Error) => { setError(e.message); setLoading(false); });
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {city && !loading && (
            <div className="p-4 sm:p-5">

              {/* ── Hero scores ──────────────────────────────────────── */}
              {inv && (
                <div className="elevated rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-around items-start flex-wrap gap-3">
                    <ScoreRing score={inv.globalScore} label="Global" size={52} />
                    <ScoreRing score={inv.yieldScore} label="Rendement" size={52} />
                    <ScoreRing score={inv.cashflowScore} label="Cashflow" size={52} />
                    <ScoreRing score={inv.beginnerScore} label="Débutant" size={52} />
                    <ScoreRing score={inv.patrimonialScore} label="Patrimonial" size={52} />
                  </div>
                </div>
              )}

              {/* ── Short verdict ─────────────────────────────────── */}
              {insights?.shortVerdict && (
                <div className={`rounded-xl px-4 py-3 mb-4 border text-sm leading-relaxed font-medium ${scoreBg(inv?.globalScore)}`}>
                  {insights.shortVerdict}
                </div>
              )}

              {/* ── 3-column mini stats ───────────────────────────── */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card p-3 text-center rounded-xl">
                  <MiniStat
                    label="Prix moyen"
                    value={bestPrice ? `${fmt.eur(bestPrice)}/m²` : '—'}
                    sub={apt && house ? 'Appt / Maison' : apt ? 'Appartement' : house ? 'Maison' : undefined}
                  />
                </div>
                <div className="card p-3 text-center rounded-xl">
                  <MiniStat
                    label="Rendement"
                    value={
                      bestYield != null ? (
                        <span className={scoreColor(bestYield * 10)}>{fmt.pct(bestYield, 1)}</span>
                      ) : '—'
                    }
                    sub="Brut estimé"
                  />
                </div>
                <div className="card p-3 text-center rounded-xl">
                  <MiniStat
                    label="Score global"
                    value={
                      inv?.globalScore != null ? (
                        <span className={scoreColor(inv.globalScore)}>{Math.round(inv.globalScore)}/100</span>
                      ) : '—'
                    }
                    sub={inv?.riskLevel ? (
                      inv.riskLevel === 'LOW' ? 'Risque faible' :
                      inv.riskLevel === 'MEDIUM' ? 'Risque modéré' : 'Risque élevé'
                    ) : undefined}
                  />
                </div>
              </div>

              {/* ── Transport ────────────────────────────────────── */}
              {tr && (
                <>
                  <Divider />
                  <SectionTitle icon={<Train size={14} />} title="Transport" />

                  {/* Classification + modes */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {tr.classification && (
                      <TransportBadge classification={tr.classification as 'ISOLATED' | 'LOW' | 'MODERATE' | 'GOOD' | 'EXCELLENT'} />
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      {tr.hasRer && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-medium">RER</span>
                      )}
                      {tr.hasTrain && (
                        <span className="text-[10px] elevated t-secondary px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-medium">Train</span>
                      )}
                      {tr.hasMetro && (
                        <span className="text-[10px] bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800 font-medium">Métro</span>
                      )}
                      {tr.hasTram && (
                        <span className="text-[10px] bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800 font-medium">Tram</span>
                      )}
                    </div>
                  </div>

                  {/* Gares les plus proches par type */}
                  <div className="space-y-1 mb-3">
                    {tr.nearestStation?.name && (
                      <p className="text-xs t-secondary">
                        Gare principale : <strong className="t-primary">{tr.nearestStation.name}</strong>
                        <span className="t-muted"> ({tr.nearestStation.distanceKm} km)</span>
                      </p>
                    )}
                    {tr.nearestRer?.name && tr.nearestRer.name !== tr.nearestStation?.name && (
                      <p className="text-xs t-secondary">
                        RER le + proche : <strong className="t-primary">{tr.nearestRer.name}</strong>
                        <span className="t-muted"> ({tr.nearestRer.distanceKm} km)</span>
                      </p>
                    )}
                    {tr.nearestTrain?.name && tr.nearestTrain.name !== tr.nearestStation?.name && (
                      <p className="text-xs t-secondary">
                        Train le + proche : <strong className="t-primary">{tr.nearestTrain.name}</strong>
                        <span className="t-muted"> ({tr.nearestTrain.distanceKm} km)</span>
                      </p>
                    )}
                    {tr.nearestMetro?.name && (
                      <p className="text-xs t-secondary">
                        Métro le + proche : <strong className="t-primary">{tr.nearestMetro.name}</strong>
                        <span className="t-muted"> ({tr.nearestMetro.distanceKm} km)</span>
                      </p>
                    )}
                    {tr.nearestTram?.name && (
                      <p className="text-xs t-secondary">
                        Tram le + proche : <strong className="t-primary">{tr.nearestTram.name}</strong>
                        <span className="t-muted"> ({tr.nearestTram.distanceKm} km)</span>
                      </p>
                    )}
                  </div>

                  {/* Rayon */}
                  <div className="flex gap-4 text-xs t-muted mb-3">
                    <span>2 km : <strong className="t-secondary">{tr.stationsWithin2Km ?? '—'} arrêts</strong></span>
                    <span>5 km : <strong className="t-secondary">{tr.stationsWithin5Km ?? '—'}</strong></span>
                    <span>10 km : <strong className="t-secondary">{tr.stationsWithin10Km ?? '—'}</strong></span>
                  </div>

                  {/* Points forts transport */}
                  {tr.transportInsights?.strengths && tr.transportInsights.strengths.length > 0 && (
                    <ul className="space-y-1 mb-2">
                      {tr.transportInsights.strengths.slice(0, 3).map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs t-secondary">
                          <Train size={11} className="text-blue-400 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Résumé transport */}
                  {tr.transportInsights?.summary && (
                    <p className="text-xs t-muted italic mb-2">{tr.transportInsights.summary}</p>
                  )}

                  {/* Projets futurs */}
                  {(tr.futureProjects?.grandParis || tr.futureProjects?.newStationPlanned) && (
                    <div className="mt-2 p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
                      <p className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-1.5">Projets à venir</p>
                      {tr.futureProjects?.grandParis && (
                        <p className="text-xs text-violet-700 dark:text-violet-300">• Ligne Grand Paris Express prévue</p>
                      )}
                      {tr.futureProjects?.newStationPlanned && (
                        <p className="text-xs text-violet-700 dark:text-violet-300">• Nouvelle gare planifiée</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── Strengths ─────────────────────────────────────── */}
              {insights?.strengths && insights.strengths.length > 0 && (
                <>
                  <Divider />
                  <SectionTitle icon={<CheckCircle2 size={14} className="text-emerald-500" />} title="Points forts" />
                  <ul className="space-y-1.5">
                    {insights.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs t-secondary">
                        <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ── Weaknesses ────────────────────────────────────── */}
              {insights?.weaknesses && insights.weaknesses.length > 0 && (
                <>
                  <Divider />
                  <SectionTitle icon={<XCircle size={14} className="text-red-500" />} title="Points faibles" />
                  <ul className="space-y-1.5">
                    {insights.weaknesses.slice(0, 3).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs t-secondary">
                        <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* ── Price details ─────────────────────────────────── */}
              {(apt || house) && (
                <>
                  <Divider />
                  <SectionTitle icon={<Building2 size={14} />} title="Prix & rendements" />
                  {apt && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold t-muted uppercase tracking-wider mb-1.5">Appartement</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-xs t-muted">Prix moyen</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.eur(apt.average)}/m²</span>
                        <span className="text-xs t-muted">Loyer</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.eur(apt.rent)}/m²/mois</span>
                        <span className="text-xs t-muted">Rendement brut</span>
                        <div className="flex justify-end"><YieldBadge value={apt.grossYield} small /></div>
                      </div>
                    </div>
                  )}
                  {house && (
                    <div>
                      <p className="text-[10px] font-semibold t-muted uppercase tracking-wider mb-1.5">Maison</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-xs t-muted">Prix moyen</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.eur(house.average)}/m²</span>
                        <span className="text-xs t-muted">Loyer</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.eur(house.rent)}/m²/mois</span>
                        <span className="text-xs t-muted">Rendement brut</span>
                        <div className="flex justify-end"><YieldBadge value={house.grossYield} small /></div>
                      </div>
                    </div>
                  )}
                  {inv?.bestPropertyType && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Recommandé : <strong>{inv.bestPropertyType === 'apartment' ? 'Appartement' : 'Maison'}</strong>
                    </p>
                  )}
                </>
              )}

              {/* ── Socio stats ───────────────────────────────────── */}
              {ins && (
                <>
                  <Divider />
                  <SectionTitle icon={<Shield size={14} />} title="Marché locatif" />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {ins.population != null && (
                      <>
                        <span className="text-xs t-muted">Population</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.num(ins.population)}</span>
                      </>
                    )}
                    {ins.medianIncome != null && (
                      <>
                        <span className="text-xs t-muted">Revenu médian</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.income(ins.medianIncome)}</span>
                      </>
                    )}
                    {ins.vacancyRate != null && (
                      <>
                        <span className="text-xs t-muted">Vacance logement</span>
                        <span className={`text-xs font-semibold text-right ${n(ins.vacancyRate) > 10 ? 'text-red-600 dark:text-red-400' : n(ins.vacancyRate) > 7 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {fmt.pct(ins.vacancyRate)}
                        </span>
                      </>
                    )}
                    {ins.tenantShare != null && (
                      <>
                        <span className="text-xs t-muted">Part locataires</span>
                        <span className="text-xs font-semibold t-primary text-right">{fmt.pct(ins.tenantShare)}</span>
                      </>
                    )}
                    {ins.populationGrowth6Y != null && (
                      <>
                        <span className="text-xs t-muted">Croissance pop. 6 ans</span>
                        <span className={`text-xs font-semibold text-right ${n(ins.populationGrowth6Y) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {fmt.growth(ins.populationGrowth6Y)}
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* ── Detailed scores ───────────────────────────────── */}
              {inv && (
                <>
                  <Divider />
                  <SectionTitle icon={<TrendingUp size={14} />} title="Scores détaillés" />
                  <div className="space-y-2">
                    {([
                      ['Rendement', inv.yieldScore],
                      ['Cashflow', inv.cashflowScore],
                      ['Patrimonial', inv.patrimonialScore],
                      ['Débutant', inv.beginnerScore],
                      ['Long terme', inv.longTermScore],
                      ['Demande locative', inv.rentalDemandScore],
                      ['Transport', inv.transportScore],
                      ['Risque (brut)', inv.riskScore],
                    ] as [string, number | null | undefined][]).map(([label, score]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs t-muted w-32 shrink-0">{label}</span>
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              n(score) >= 70 ? 'bg-emerald-500' :
                              n(score) >= 50 ? 'bg-blue-500' :
                              n(score) >= 30 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, n(score)))}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-10 text-right ${scoreColor(score)}`}>
                          {score != null ? `${Math.round(score)}` : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── CTA ───────────────────────────────────────────── */}
              <div className="mt-6 pb-2">
                <button
                  onClick={handleNavigate}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                >
                  Voir analyse complète
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0);    opacity: 1;   }
        }
      `}</style>
    </>
  );
}
