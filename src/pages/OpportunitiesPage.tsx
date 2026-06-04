import { useMemo } from 'react';
import type { City } from '../types/city';
import { getRankings } from '../lib/rankings';
import { n } from '../lib/formatters';
import { OpportunitySection } from '../components/opportunities/OpportunitySection';

interface Props {
  cities: City[];
  onCityClick: (city: City) => void;
}

export function OpportunitiesPage({ cities, onCityClick }: Props) {
  const rankings = useMemo(() => getRankings(cities), [cities]);

  const sections = [
    { title: 'Top 20 — Score global', subtitle: 'Meilleures communes toutes stratégies', emoji: '🌟', cities: rankings.topGlobal, getter: (c: City) => n(c.investment?.globalScore) },
    { title: 'Top 20 — Cashflow', subtitle: 'Fort rendement, hors pièges identifiés', emoji: '💰', cities: rankings.topCashflow, getter: (c: City) => n(c.investment?.cashflowScore) },
    { title: 'Top 20 — Débutant', subtitle: 'Profil rassurant pour premier investissement', emoji: '🎯', cities: rankings.topBeginner, getter: (c: City) => n(c.investment?.beginnerScore) },
    { title: 'Top 20 — Patrimonial', subtitle: 'Sécurité et valorisation long terme', emoji: '🏛️', cities: rankings.topPatrimonial, getter: (c: City) => n(c.investment?.patrimonialScore) },
    { title: 'Top 20 — Long terme', subtitle: 'Potentiel de valorisation élevé', emoji: '📈', cities: rankings.topLongTerm, getter: (c: City) => n(c.investment?.longTermScore) },
    { title: 'Top 20 — Rendement apparent appt', subtitle: 'Rendement brut le plus élevé (vérifier la vacance)', emoji: '⚡', cities: rankings.topYieldApt, getter: (c: City) => n(c.prices.apartment.grossYield) },
    { title: 'Top 20 — Rendement apparent maison', subtitle: 'Rendement brut maison le plus élevé', emoji: '🏠', cities: rankings.topYieldHouse, getter: (c: City) => n(c.prices.house.grossYield) },
    { title: '⚠️ Pièges rendement', subtitle: 'Haut rendement apparent mais risque très élevé', emoji: '🪤', cities: rankings.topYieldTrap, getter: (c: City) => n(c.investment?.yieldScore) },
    { title: 'Top 20 — Bien desservies (transport)', subtitle: 'Meilleur score transport', emoji: '🚊', cities: rankings.topTransport, getter: (c: City) => n(c.transport?.transportScore) },
    { title: 'Top 20 — Prix les plus accessibles', subtitle: 'Moins cher au m² appartement', emoji: '🪙', cities: rankings.topCheap, getter: (c: City) => -n(c.prices.apartment.average) },
    { title: 'Top 20 — Sécurisées (risque modéré/faible)', subtitle: 'Bon score global avec risque acceptable', emoji: '🛡️', cities: rankings.topSafe, getter: (c: City) => n(c.investment?.globalScore) },
    { title: 'Top 20 — Rendement élevé + transport correct', subtitle: 'Rendement ≥ 6% avec bonne desserte', emoji: '🎯', cities: rankings.topYieldTransport, getter: (c: City) => n(c.investment?.cashflowScore) },
    { title: 'Top 20 — Revenu élevé + rendement correct', subtitle: 'Bonne solvabilité locataires + rendement ≥ 5%', emoji: '💎', cities: rankings.topIncomeYield, getter: (c: City) => n(c.investment?.globalScore) },
    { title: '❌ Communes à éviter', subtitle: 'Recommandation AVOID ou AVOID_FOR_BEGINNER', emoji: '🚫', cities: rankings.toAvoid, getter: (c: City) => n(c.investment?.riskScore) },
  ];

  return (
    <div className="p-6 space-y-3">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-100">Opportunités</h2>
        <p className="text-sm text-slate-500 mt-1">
          {cities.length} communes analysées — cliquez sur une section pour la déployer
        </p>
      </div>
      {sections.map((s, i) => (
        <OpportunitySection
          key={s.title}
          title={s.title}
          subtitle={s.subtitle}
          emoji={s.emoji}
          cities={s.cities}
          scoreGetter={s.getter}
          onCityClick={onCityClick}
          defaultExpanded={i === 0}
          maxVisible={6}
        />
      ))}
    </div>
  );
}
