import { X, ExternalLink, Building2, Home, Train, Users, TrendingUp, Shield } from 'lucide-react';
import type { City } from '../../types/city';
import { fmt, n } from '../../lib/formatters';
import { ProfileBadge, RiskBadge, RecoBadge, YieldBadge, TransportBadge } from '../ui/Badge';
import { ScoreRing } from '../ui/ScoreBadge';
import { CityVerdict } from './CityVerdict';
import { ScoreRadar } from './ScoreRadar';

interface Props {
  city: City | null;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="text-xs font-semibold text-slate-200 text-right">{value}</div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pt-5 first:pt-0">
      <div className="text-slate-500">{icon}</div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
    </div>
  );
}

export function CityDetailsDrawer({ city, onClose }: Props) {
  if (!city) return null;
  const inv = city.investment;
  const ins = city.insee;
  const tr = city.transport;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-slate-950 border-l border-slate-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-start justify-between z-10">
          <div>
            <h2 className="text-lg font-black text-slate-100">{city.city}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Dép. {city.department} · {city.postalCode}
              {city.geo?.inseeCode && ` · INSEE ${city.geo.inseeCode}`}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {inv?.profile && <ProfileBadge profile={inv.profile} small />}
              {inv?.riskLevel && <RiskBadge risk={inv.riskLevel} small />}
              {inv?.recommendation && <RecoBadge reco={inv.recommendation} small />}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-1">
          {/* Scores ring row */}
          {inv && (
            <div className="flex justify-around py-4 bg-slate-900 rounded-xl border border-slate-800 mb-4">
              <ScoreRing score={inv.globalScore} label="Global" size={52} />
              <ScoreRing score={inv.cashflowScore} label="Cashflow" size={52} />
              <ScoreRing score={inv.beginnerScore} label="Débutant" size={52} />
              <ScoreRing score={inv.patrimonialScore} label="Patrimonial" size={52} />
              <ScoreRing score={inv.longTermScore} label="Long terme" size={52} />
            </div>
          )}

          {/* Radar */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-4">
            <p className="label-xs mb-3">Radar multi-critères</p>
            <ScoreRadar cities={[city]} />
          </div>

          {/* Verdict */}
          <SectionTitle icon={<Shield size={14} />} title="Analyse & Verdict" />
          <CityVerdict city={city} />

          {/* Rentabilité appartement */}
          <SectionTitle icon={<Building2 size={14} />} title="Appartement" />
          <Row label="Prix moyen" value={`${fmt.eur(city.prices.apartment.average)}/m²`} />
          <Row label="Prix min / max" value={`${fmt.eur(city.prices.apartment.min)} — ${fmt.eur(city.prices.apartment.max)}`} />
          <Row label="Loyer moyen" value={`${fmt.eur(city.prices.apartment.rent)}/m²/mois`} />
          <Row label="Rendement brut" value={<YieldBadge value={city.prices.apartment.grossYield} />} />

          {/* Rentabilité maison */}
          <SectionTitle icon={<Home size={14} />} title="Maison" />
          <Row label="Prix moyen" value={`${fmt.eur(city.prices.house.average)}/m²`} />
          <Row label="Prix min / max" value={`${fmt.eur(city.prices.house.min)} — ${fmt.eur(city.prices.house.max)}`} />
          <Row label="Loyer moyen" value={`${fmt.eur(city.prices.house.rent)}/m²/mois`} />
          <Row label="Rendement brut" value={<YieldBadge value={city.prices.house.grossYield} />} />
          {inv?.bestPropertyType && (
            <div className="text-xs text-blue-400 py-1">
              ★ Meilleur bien recommandé : <strong>{inv.bestPropertyType === 'apartment' ? 'Appartement' : 'Maison'}</strong>
            </div>
          )}

          {/* Socio-économique */}
          {ins && (
            <>
              <SectionTitle icon={<Users size={14} />} title="Socio-économique" />
              <Row label="Population" value={fmt.num(ins.population)} />
              <Row label="Densité" value={`${fmt.num(ins.density)} hab/km²`} />
              <Row label="Revenu médian" value={fmt.income(ins.medianIncome)} />
              <Row label="Croissance pop. 6 ans" value={
                <span className={n(ins.populationGrowth6Y) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {fmt.growth(ins.populationGrowth6Y)}
                </span>
              } />
              <Row label="Vacance logement" value={
                <span className={n(ins.vacancyRate) > 10 ? 'text-red-400' : n(ins.vacancyRate) > 7 ? 'text-amber-400' : 'text-emerald-400'}>
                  {fmt.pct(ins.vacancyRate)}
                </span>
              } />
              <Row label="Part locataires" value={fmt.pct(ins.tenantShare)} />
              <Row label="Part propriétaires" value={fmt.pct(ins.ownerShare)} />
            </>
          )}

          {/* Transport */}
          {tr && (
            <>
              <SectionTitle icon={<Train size={14} />} title="Transport" />
              {tr.classification && <div className="mb-3"><TransportBadge classification={tr.classification} /></div>}
              {tr.nearestStation && (
                <Row label="Gare la plus proche" value={`${tr.nearestStation.name} (${tr.nearestStation.type}) · ${fmt.km(tr.nearestStation.distanceKm)}`} />
              )}
              <Row label="Gares dans 5 km" value={String(tr.stationsWithin5Km ?? '—')} />
              <Row label="Score transport" value={fmt.score(tr.transportScore)} />
              <div className="flex gap-2 mt-2 flex-wrap">
                {tr.hasRer && <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800">RER</span>}
                {tr.hasTrain && <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">Train</span>}
                {tr.hasMetro && <span className="text-[10px] bg-violet-900 text-violet-300 px-2 py-0.5 rounded-full border border-violet-800">Métro</span>}
                {tr.hasTram && <span className="text-[10px] bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">Tram</span>}
              </div>
              {tr.transportInsights?.summary && (
                <p className="text-xs text-slate-400 mt-3 leading-relaxed bg-slate-800 rounded-lg p-3 border border-slate-700">
                  {tr.transportInsights.summary}
                </p>
              )}
            </>
          )}

          {/* Scores détaillés */}
          {inv && (
            <>
              <SectionTitle icon={<TrendingUp size={14} />} title="Scores détaillés" />
              <Row label="Risque (brut)" value={
                <span className={n(inv.riskScore) > 70 ? 'text-red-400' : n(inv.riskScore) > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                  {fmt.score(inv.riskScore)}
                </span>
              } />
              <Row label="Rendement" value={fmt.score(inv.yieldScore)} />
              <Row label="Accessibilité prix" value={fmt.score(inv.priceAccessibilityScore)} />
              <Row label="Pouvoir locatif" value={fmt.score(inv.rentPowerScore)} />
              <Row label="Demande locative" value={fmt.score(inv.rentalDemandScore)} />
              <Row label="Socio-économique" value={fmt.score(inv.socioScore)} />
              <Row label="Croissance" value={fmt.score(inv.growthScore)} />
              <Row label="Transport (invest.)" value={fmt.score(inv.transportScore)} />
            </>
          )}

          {/* CTA */}
          {city.url && (
            <a
              href={city.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full mt-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              <ExternalLink size={14} />
              Voir sur MeilleursAgents
            </a>
          )}
        </div>
      </div>
    </>
  );
}
