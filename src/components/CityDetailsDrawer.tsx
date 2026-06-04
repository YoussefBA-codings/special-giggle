import { X, ExternalLink, TrendingUp, Home, Building2, Banknote, MapPin, Star } from 'lucide-react';
import type { CityWithScore } from '../types/city';
import { formatEur, formatPct, getYieldBadge, getCityAnalysis } from '../lib/calculations';

interface Props {
  city: CityWithScore | null;
  onClose: () => void;
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2.5 border-b border-slate-100 ${accent ? 'bg-blue-50/50 -mx-5 px-5' : ''}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-slate-500">{icon}</div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function YieldBadge({ value }: { value: number }) {
  const badge = getYieldBadge(value);
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ color: badge.color, backgroundColor: badge.bg }}
    >
      {badge.label} — {formatPct(value)}
    </span>
  );
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70 ? '#15803d' :
    score >= 50 ? '#1d4ed8' :
    score >= 30 ? '#b45309' :
    '#b91c1c';

  const bg =
    score >= 70 ? '#dcfce7' :
    score >= 50 ? '#dbeafe' :
    score >= 30 ? '#fef3c7' :
    '#fee2e2';

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold"
        style={{ color, backgroundColor: bg }}
      >
        {score}
      </div>
      <div>
        <p className="text-xs text-slate-400">Score investisseur</p>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}

export function CityDetailsDrawer({ city, onClose }: Props) {
  if (!city) return null;

  const analysis = getCityAnalysis(city);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{city.city}</h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={12} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                Département {city.department} · {city.postalCode}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Scores */}
          <Section title="Score investisseur" icon={<Star size={14} />}>
            <div className="flex gap-6 py-2">
              <ScoreRing score={city.scoreApartment} label="Appartement" />
              <ScoreRing score={city.scoreHouse} label="Maison" />
            </div>
          </Section>

          {/* Appartement */}
          <Section title="Appartement" icon={<Building2 size={14} />}>
            <Row label="Prix moyen" value={`${formatEur(city.prices.apartment.average)}/m²`} />
            <Row label="Prix minimum" value={`${formatEur(city.prices.apartment.min)}/m²`} />
            <Row label="Prix maximum" value={`${formatEur(city.prices.apartment.max)}/m²`} />
            <Row label="Loyer moyen" value={`${formatEur(city.prices.apartment.rent)}/m²/mois`} />
            <Row
              label="Rendement brut"
              value={<YieldBadge value={city.prices.apartment.grossYield} />}
              accent
            />
          </Section>

          {/* Maison */}
          <Section title="Maison" icon={<Home size={14} />}>
            <Row label="Prix moyen" value={`${formatEur(city.prices.house.average)}/m²`} />
            <Row label="Prix minimum" value={`${formatEur(city.prices.house.min)}/m²`} />
            <Row label="Prix maximum" value={`${formatEur(city.prices.house.max)}/m²`} />
            <Row label="Loyer moyen" value={`${formatEur(city.prices.house.rent)}/m²/mois`} />
            <Row
              label="Rendement brut"
              value={<YieldBadge value={city.prices.house.grossYield} />}
              accent
            />
          </Section>

          {/* Tous types */}
          <Section title="Tous types" icon={<Banknote size={14} />}>
            <Row label="Loyer moyen toutes typologies" value={`${formatEur(city.prices.all.rent)}/m²/mois`} />
          </Section>

          {/* Rendement comparatif */}
          <Section title="Comparatif rendement" icon={<TrendingUp size={14} />}>
            <div className="mt-2 space-y-3">
              {[
                { label: 'Appartement', value: city.prices.apartment.grossYield },
                { label: 'Maison', value: city.prices.house.grossYield },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold">{formatPct(value)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (value / 12) * 100)}%`,
                        backgroundColor: value >= 7 ? '#15803d' : value >= 5 ? '#1d4ed8' : value >= 3 ? '#b45309' : '#b91c1c',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Analyse automatique */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5">Analyse</p>
            <p className="text-sm text-blue-900 leading-relaxed">{analysis}</p>
          </div>

          {/* Lien source */}
          <a
            href={city.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={14} />
            Voir sur MeilleursAgents
          </a>
        </div>
      </div>
    </>
  );
}
