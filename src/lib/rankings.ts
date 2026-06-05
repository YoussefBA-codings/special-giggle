// Investor profile definitions (static metadata)
// Actual city data is now fetched from the API per profile

export interface InvestorProfile {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  criteria: string[];
  // API params for fetching cities matching this profile
  apiParams: { profile?: string; riskLevel?: string; minYield?: number; sortBy: string };
  avoidApiParams: { profile?: string; riskLevel?: string };
}

export const INVESTOR_PROFILES: InvestorProfile[] = [
  {
    id: 'cashflow',
    label: 'Cashflow Agressif',
    emoji: '💰',
    color: 'emerald',
    description: 'Maximiser les revenus locatifs immédiats avec un fort rendement brut.',
    criteria: ['Rendement appartement > 7%', 'Profil HIGH_YIELD', 'Score cashflow élevé'],
    apiParams: { profile: 'HIGH_YIELD', sortBy: 'cashflowScore' },
    avoidApiParams: { profile: 'YIELD_TRAP' },
  },
  {
    id: 'beginner',
    label: 'Premier Investissement',
    emoji: '🎯',
    color: 'blue',
    description: 'Villes sécurisées, compréhensibles et avec un bon équilibre risque/rendement.',
    criteria: ['Score débutant élevé', 'Risque LOW', 'Profil BEGINNER_FRIENDLY'],
    apiParams: { profile: 'BEGINNER_FRIENDLY', sortBy: 'beginnerScore' },
    avoidApiParams: { profile: 'YIELD_TRAP' },
  },
  {
    id: 'patrimonial',
    label: 'Patrimonial Sécurisé',
    emoji: '🏛️',
    color: 'violet',
    description: 'Valorisation sur le long terme, protection du capital, marchés stables.',
    criteria: ['Risque LOW', 'Score patrimonial élevé', 'Profil PATRIMONIAL'],
    apiParams: { profile: 'PATRIMONIAL', riskLevel: 'LOW', sortBy: 'patrimonialScore' },
    avoidApiParams: { riskLevel: 'HIGH' },
  },
  {
    id: 'balanced',
    label: 'Équilibré',
    emoji: '⚖️',
    color: 'teal',
    description: 'Bon compromis entre rendement, sécurité et potentiel de valorisation.',
    criteria: ['Profil BALANCED_OPPORTUNITY', 'Score global élevé'],
    apiParams: { profile: 'BALANCED_OPPORTUNITY', sortBy: 'globalScore' },
    avoidApiParams: { profile: 'YIELD_TRAP' },
  },
  {
    id: 'antitrap',
    label: 'Anti-Risque',
    emoji: '🛡️',
    color: 'rose',
    description: 'Éviter les pièges, les rendements trompeurs et les marchés risqués.',
    criteria: ['Risque LOW', 'Exclure YIELD_TRAP', 'Score global correct'],
    apiParams: { riskLevel: 'LOW', sortBy: 'globalScore' },
    avoidApiParams: { profile: 'YIELD_TRAP' },
  },
  {
    id: 'highyield',
    label: 'Rendement Élevé',
    emoji: '⚡',
    color: 'amber',
    description: 'Communes avec les meilleurs rendements bruts.',
    criteria: ['Rendement appartement élevé', 'Score rendement fort'],
    apiParams: { sortBy: 'apartmentYield' },
    avoidApiParams: {},
  },
];
