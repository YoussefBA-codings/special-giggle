import type { InvestmentProfile, RiskLevel, Recommendation, TransportClassification } from './city';

export interface Filters {
  search: string;
  department: string;
  profile: InvestmentProfile | '';
  recommendation: Recommendation | '';
  riskLevel: RiskLevel | '';
  bestPropertyType: 'apartment' | 'house' | '';
  transportClassification: TransportClassification | '';
  selectedTags: string[];
  minYield: number;
  maxYield: number;
  maxPrice: number;
  minRent: number;
  maxVacancy: number;
  minPopulation: number;
  minIncome: number;
  minGrowth: number;
  maxStationDistance: number;
  minGlobalScore: number;
  minCashflowScore: number;
  minBeginnerScore: number;
  minPatrimonialScore: number;
  excludeYieldTrap: boolean;
  excludeIsolated: boolean;
  beginnerOnly: boolean;
  cashflowOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  department: '',
  profile: '',
  recommendation: '',
  riskLevel: '',
  bestPropertyType: '',
  transportClassification: '',
  selectedTags: [],
  minYield: 0,
  maxYield: 0,
  maxPrice: 0,
  minRent: 0,
  maxVacancy: 0,
  minPopulation: 0,
  minIncome: 0,
  minGrowth: -999,
  maxStationDistance: 0,
  minGlobalScore: 0,
  minCashflowScore: 0,
  minBeginnerScore: 0,
  minPatrimonialScore: 0,
  excludeYieldTrap: false,
  excludeIsolated: false,
  beginnerOnly: false,
  cashflowOnly: false,
};

export interface FilterPreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  filters: Partial<Filters>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'cashflow',
    label: 'Cashflow positif',
    icon: '💰',
    description: 'Rendement > 7%, vacance < 10%',
    filters: { minYield: 7, maxVacancy: 10, excludeYieldTrap: false },
  },
  {
    id: 'beginner',
    label: 'Premier investissement',
    icon: '🎯',
    description: 'Villes recommandées pour débutants',
    filters: { beginnerOnly: true, excludeYieldTrap: true, excludeIsolated: true, minBeginnerScore: 50 },
  },
  {
    id: 'patrimonial',
    label: 'Patrimonial sécurisé',
    icon: '🏛️',
    description: 'Risque faible, valorisation long terme',
    filters: { profile: 'PATRIMONIAL_SAFE', riskLevel: '' },
  },
  {
    id: 'longterm',
    label: 'Long terme',
    icon: '📈',
    description: 'Potentiel de valorisation fort',
    filters: { minGrowth: 0, minPatrimonialScore: 40 },
  },
  {
    id: 'smallbudget',
    label: 'Petit budget',
    icon: '🪙',
    description: 'Prix au m² < 3 000 €',
    filters: { maxPrice: 3000 },
  },
  {
    id: 'transport',
    label: 'Proche transport',
    icon: '🚊',
    description: 'Gare à moins de 5 km',
    filters: { maxStationDistance: 5 },
  },
  {
    id: 'notraps',
    label: 'Éviter les pièges',
    icon: '🛡️',
    description: 'Exclure rendements pièges et isolés',
    filters: { excludeYieldTrap: true, excludeIsolated: true },
  },
  {
    id: 'highyield_safe',
    label: 'Rendement > 7% + risque modéré',
    icon: '⚡',
    description: 'Bon rendement sans risque excessif',
    filters: { minYield: 7, riskLevel: 'MODERATE' as RiskLevel },
  },
  {
    id: 'lowvacancy',
    label: 'Vacance < 8%',
    icon: '🏠',
    description: 'Marché locatif tendu',
    filters: { maxVacancy: 8 },
  },
  {
    id: 'strong_only',
    label: 'Fortes opportunités',
    icon: '🌟',
    description: 'Score global > 60',
    filters: { minGlobalScore: 60, excludeYieldTrap: true },
  },
];
