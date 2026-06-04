import type { City } from '../types/city';
import { n } from './formatters';

export interface RankedList {
  title: string;
  subtitle: string;
  cities: City[];
  valueKey: string;
  valueGetter: (c: City) => string;
}

export function topN(cities: City[], n: number, getter: (c: City) => number): City[] {
  return [...cities].sort((a, b) => getter(b) - getter(a)).slice(0, n);
}

export function topNFiltered(cities: City[], count: number, getter: (c: City) => number, filter?: (c: City) => boolean): City[] {
  const filtered = filter ? cities.filter(filter) : cities;
  return topN(filtered, count, getter);
}

export function getRankings(cities: City[]) {
  return {
    topGlobal: topN(cities, 20, (c) => n(c.investment?.globalScore)),
    topCashflow: topNFiltered(cities, 20, (c) => n(c.investment?.cashflowScore), (c) => c.investment?.profile !== 'YIELD_TRAP'),
    topBeginner: topN(cities, 20, (c) => n(c.investment?.beginnerScore)),
    topPatrimonial: topN(cities, 20, (c) => n(c.investment?.patrimonialScore)),
    topLongTerm: topN(cities, 20, (c) => n(c.investment?.longTermScore)),
    topYieldApt: topN(cities, 20, (c) => n(c.prices.apartment.grossYield)),
    topYieldHouse: topN(cities, 20, (c) => n(c.prices.house.grossYield)),
    topYieldTrap: topNFiltered(cities, 20, (c) => n(c.investment?.yieldScore), (c) => c.investment?.profile === 'YIELD_TRAP'),
    topTransport: topN(cities, 20, (c) => n(c.transport?.transportScore)),
    topCheap: topNFiltered(cities, 20, (c) => -n(c.prices.apartment.average, 99999), (c) => n(c.prices.apartment.average) > 0),
    topSafe: topNFiltered(cities, 20, (c) => n(c.investment?.globalScore), (c) =>
      (c.investment?.riskLevel === 'LOW' || c.investment?.riskLevel === 'MODERATE') && n(c.investment?.globalScore) > 40
    ),
    topYieldTransport: topNFiltered(cities, 20, (c) => n(c.investment?.cashflowScore), (c) =>
      n(c.prices.apartment.grossYield) >= 6 && n(c.transport?.transportScore) >= 50
    ),
    topIncomeYield: topNFiltered(cities, 20, (c) => n(c.investment?.globalScore), (c) =>
      n(c.insee?.medianIncome) >= 25000 && n(c.prices.apartment.grossYield) >= 5
    ),
    toAvoid: topNFiltered(cities, 20, (c) => n(c.investment?.riskScore), (c) =>
      c.investment?.recommendation === 'AVOID' || c.investment?.recommendation === 'AVOID_FOR_BEGINNER'
    ),
  };
}

export interface InvestorProfile {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  criteria: string[];
  cities: City[];
  toAvoid: City[];
}

export function getInvestorProfiles(cities: City[]): InvestorProfile[] {
  return [
    {
      id: 'cashflow',
      label: 'Cashflow Agressif',
      emoji: '💰',
      color: 'emerald',
      description: 'Maximiser les revenus locatifs immédiats avec un fort rendement brut.',
      criteria: ['Rendement appartement > 7%', 'Vacance < 10%', 'Profil CASHFLOW_OPPORTUNITY ou BALANCED'],
      cities: topNFiltered(cities, 30, (c) => n(c.investment?.cashflowScore), (c) =>
        n(c.prices.apartment.grossYield) >= 7 && c.investment?.profile !== 'YIELD_TRAP'
      ),
      toAvoid: cities.filter((c) => c.investment?.profile === 'PATRIMONIAL_SAFE' || n(c.prices.apartment.grossYield) < 4).slice(0, 10),
    },
    {
      id: 'beginner',
      label: 'Premier Investissement',
      emoji: '🎯',
      color: 'blue',
      description: 'Villes sécurisées, compréhensibles et avec un bon équilibre risque/rendement.',
      criteria: ['Score débutant > 50', 'Risque LOW ou MODERATE', 'Commune non isolée', 'Pas de piège'],
      cities: topNFiltered(cities, 30, (c) => n(c.investment?.beginnerScore), (c) =>
        n(c.investment?.beginnerScore) >= 40 && c.investment?.profile !== 'YIELD_TRAP' && c.transport?.classification !== 'ISOLATED'
      ),
      toAvoid: cities.filter((c) => c.investment?.riskLevel === 'VERY_HIGH' || c.investment?.profile === 'YIELD_TRAP').slice(0, 10),
    },
    {
      id: 'patrimonial',
      label: 'Patrimonial Sécurisé',
      emoji: '🏛️',
      color: 'violet',
      description: 'Valorisation sur le long terme, protection du capital, marchés stables.',
      criteria: ['Risque LOW', 'Score patrimonial > 50', 'Revenu médian élevé', 'Croissance positive'],
      cities: topNFiltered(cities, 30, (c) => n(c.investment?.patrimonialScore), (c) =>
        n(c.investment?.patrimonialScore) >= 40 && (c.investment?.riskLevel === 'LOW' || c.investment?.riskLevel === 'MODERATE')
      ),
      toAvoid: cities.filter((c) => n(c.prices.apartment.grossYield) > 10 && c.investment?.riskLevel === 'VERY_HIGH').slice(0, 10),
    },
    {
      id: 'longterm',
      label: 'Long Terme',
      emoji: '📈',
      color: 'cyan',
      description: 'Communes à fort potentiel de valorisation et de développement.',
      criteria: ['Score long terme > 50', 'Croissance population positive', 'Score socio-éco élevé'],
      cities: topNFiltered(cities, 30, (c) => n(c.investment?.longTermScore), (c) =>
        n(c.investment?.longTermScore) >= 40
      ),
      toAvoid: cities.filter((c) => n(c.insee?.populationGrowth6Y) < -5).slice(0, 10),
    },
    {
      id: 'antitrap',
      label: 'Anti-Risque',
      emoji: '🛡️',
      color: 'rose',
      description: 'Éviter les pièges, les communes isolées et les marchés dévalorisants.',
      criteria: ['Exclure YIELD_TRAP', 'Exclure communes isolées', 'Vacance < 8%', 'Transport correct'],
      cities: topNFiltered(cities, 30, (c) => n(c.investment?.globalScore), (c) =>
        c.investment?.profile !== 'YIELD_TRAP' && c.transport?.classification !== 'ISOLATED' &&
        n(c.insee?.vacancyRate) < 8 && n(c.transport?.transportScore) >= 40
      ),
      toAvoid: cities.filter((c) => c.investment?.profile === 'YIELD_TRAP' || c.transport?.classification === 'ISOLATED').slice(0, 10),
    },
    {
      id: 'transport',
      label: 'Proche Transport',
      emoji: '🚊',
      color: 'amber',
      description: 'Communes bien desservies par les transports en commun.',
      criteria: ['Gare < 5 km', 'Score transport > 60', 'Classification GOOD ou EXCELLENT'],
      cities: topNFiltered(cities, 30, (c) => n(c.transport?.transportScore), (c) =>
        n(c.transport?.nearestStation?.distanceKm) <= 5
      ),
      toAvoid: cities.filter((c) => c.transport?.classification === 'ISOLATED').slice(0, 10),
    },
  ];
}
