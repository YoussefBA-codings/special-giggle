import type { RiskLevel } from './city';

export interface Filters {
  search: string;
  department: string;
  profile: string;
  riskLevel: RiskLevel | '';
  minYield: number;
  maxYield: number;
  maxPrice: number;
  minGlobalScore: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  department: '',
  profile: '',
  riskLevel: '',
  minYield: 0,
  maxYield: 0,
  maxPrice: 0,
  minGlobalScore: 0,
  sortBy: 'globalScore',
  sortOrder: 'desc',
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
    description: 'Rendement > 7%',
    filters: { minYield: 7, profile: 'HIGH_YIELD' },
  },
  {
    id: 'beginner',
    label: 'Premier investissement',
    icon: '🎯',
    description: 'Villes recommandées pour débutants',
    filters: { profile: 'BEGINNER_FRIENDLY' },
  },
  {
    id: 'patrimonial',
    label: 'Patrimonial sécurisé',
    icon: '🏛️',
    description: 'Risque faible, valorisation long terme',
    filters: { profile: 'PATRIMONIAL', riskLevel: 'LOW' },
  },
  {
    id: 'balanced',
    label: 'Équilibré',
    icon: '⚖️',
    description: 'Bon équilibre rendement/risque',
    filters: { profile: 'BALANCED_OPPORTUNITY' },
  },
  {
    id: 'smallbudget',
    label: 'Petit budget',
    icon: '🪙',
    description: 'Prix au m² < 3 000 €',
    filters: { maxPrice: 3000 },
  },
  {
    id: 'notraps',
    label: 'Éviter les pièges',
    icon: '🛡️',
    description: 'Exclure yield traps',
    filters: { riskLevel: 'LOW' },
  },
  {
    id: 'highyield',
    label: 'Rendement élevé',
    icon: '⚡',
    description: 'Rendement > 7%',
    filters: { minYield: 7 },
  },
  {
    id: 'strong_only',
    label: 'Fortes opportunités',
    icon: '🌟',
    description: 'Score global > 60',
    filters: { minGlobalScore: 60 },
  },
];
