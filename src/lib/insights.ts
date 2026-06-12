import type { CommuneDetail, RegionDetail, DepartmentDetail } from '../types/api';

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Très bien';
  if (score >= 40) return 'Bien';
  if (score >= 20) return 'Moyen';
  return 'Faible';
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (score >= 40) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
}

// ---------------------------------------------------------------------------
// Risk helpers
// ---------------------------------------------------------------------------

export function riskBg(level: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (level) {
    case 'LOW':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'HIGH':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
}

export function riskLabel(level: string): string {
  switch (level) {
    case 'LOW':
      return 'Risque faible';
    case 'MEDIUM':
      return 'Risque modéré';
    case 'HIGH':
      return 'Risque élevé';
    default:
      return 'Risque inconnu';
  }
}

// ---------------------------------------------------------------------------
// Profile helpers
// ---------------------------------------------------------------------------

export function profileLabel(profile: string): string {
  switch (profile) {
    case 'BEGINNER_FRIENDLY':
      return 'Débutant';
    case 'CASHFLOW_OPPORTUNITY':
      return 'Cashflow';
    case 'HIGH_YIELD':
      return 'Haut rendement';
    case 'PATRIMONIAL':
      return 'Patrimonial';
    case 'YIELD_TRAP':
      return 'Piège à rendement';
    case 'BALANCED_OPPORTUNITY':
      return 'Équilibré';
    case 'DEFAULT':
      return 'Standard';
    default:
      return profile;
  }
}

export function profileBg(profile: string): string {
  switch (profile) {
    case 'BEGINNER_FRIENDLY':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'CASHFLOW_OPPORTUNITY':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'HIGH_YIELD':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'PATRIMONIAL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'YIELD_TRAP':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
  }
}

// ---------------------------------------------------------------------------
// Investment profile classification
// ---------------------------------------------------------------------------

type InvestmentProfileType = 'CASHFLOW' | 'PATRIMONIAL' | 'BALANCED' | 'RISKY' | 'EMERGING';

interface AggregateScores {
  avgApartmentYield: number | null;
  avgRiskScore: number;
  avgGlobalScore: number;
}

function classifyProfile(scores: AggregateScores): InvestmentProfileType {
  const { avgApartmentYield, avgRiskScore, avgGlobalScore } = scores;
  const yield_ = avgApartmentYield ?? 0;

  if (avgRiskScore > 60) return 'RISKY';
  if (yield_ >= 6 && avgRiskScore < 40) return 'CASHFLOW';
  if (yield_ < 4 && avgRiskScore < 30 && avgGlobalScore >= 55) return 'PATRIMONIAL';
  if (avgGlobalScore < 35) return 'EMERGING';
  return 'BALANCED';
}

export function getRegionProfile(region: RegionDetail): string {
  return classifyProfile({
    avgApartmentYield: region.avgApartmentYield,
    avgRiskScore: region.avgRiskScore,
    avgGlobalScore: region.avgGlobalScore,
  });
}

export function getDepartmentProfile(dept: DepartmentDetail): string {
  return classifyProfile({
    avgApartmentYield: dept.avgApartmentYield,
    avgRiskScore: dept.avgRiskScore,
    avgGlobalScore: dept.avgGlobalScore,
  });
}

// ---------------------------------------------------------------------------
// Shared aggregate insight rules
// ---------------------------------------------------------------------------

interface AggregateInsightData {
  avgApartmentYield: number | null;
  avgRiskScore: number;
  avgGlobalScore: number;
  avgTenantShare: number | null;
  avgVacancyRate: number | null;
  avgMedianIncome: number | null;
  avgCashflowScore: number;
  avgPatrimonialScore: number;
  avgBeginnerScore: number;
  topGlobal: { city: string }[];
  yieldTraps: { city: string }[];
}

function buildAggregateInsights(data: AggregateInsightData): string[] {
  const insights: string[] = [];
  const yield_ = data.avgApartmentYield;

  // Yield
  if (yield_ != null) {
    if (yield_ > 7) {
      insights.push('Rendements supérieurs à la moyenne nationale :potentiel cashflow fort');
    } else if (yield_ >= 5) {
      insights.push('Rendements dans la moyenne nationale :bon équilibre rendement/risque');
    } else if (yield_ < 3.5) {
      insights.push('Rendements bruts faibles :stratégie principalement patrimoniale');
    }
  }

  // Risk
  if (data.avgRiskScore < 20) {
    insights.push('Marché à faible risque structurel :sécurité élevée pour l\'investisseur');
  } else if (data.avgRiskScore < 40) {
    insights.push('Niveau de risque modéré :profil adapté aux investisseurs intermédiaires');
  } else if (data.avgRiskScore >= 60) {
    insights.push('Vigilance : niveau de risque élevé :due diligence renforcée recommandée');
  }

  // Tenant share
  if (data.avgTenantShare != null) {
    if (data.avgTenantShare > 50) {
      insights.push('Forte culture locative :demande locative soutenue et marché locatif profond');
    } else if (data.avgTenantShare < 30) {
      insights.push('Marché à dominante propriétaires :liquidité locative limitée');
    }
  }

  // Vacancy
  if (data.avgVacancyRate != null) {
    if (data.avgVacancyRate > 10) {
      insights.push('Vigilance : taux de vacance élevé :risque de logements vacants non négligeable');
    } else if (data.avgVacancyRate < 5) {
      insights.push('Taux de vacance très bas :forte tension locative et faible risque de vacance');
    }
  }

  // Median income
  if (data.avgMedianIncome != null) {
    if (data.avgMedianIncome > 35000) {
      insights.push('Niveau de vie élevé :solvabilité locataire forte et loyers soutenables');
    } else if (data.avgMedianIncome < 22000) {
      insights.push('Revenus médians faibles :solvabilité locataire à surveiller');
    }
  }

  // Global score
  if (data.avgGlobalScore > 60) {
    insights.push('Une des meilleures zones pour investir :score global au-dessus des 60 pts');
  } else if (data.avgGlobalScore < 35) {
    insights.push('Score global faible :marché émergent ou peu favorable à l\'investissement');
  }

  // Cashflow
  if (data.avgCashflowScore > 65) {
    insights.push('Excellent potentiel cashflow :idéal pour investisseurs recherchant des revenus immédiats');
  }

  // Patrimonial
  if (data.avgPatrimonialScore > 65) {
    insights.push('Fort potentiel patrimonial :valorisation attendue sur le long terme');
  }

  // Beginner
  if (data.avgBeginnerScore > 65) {
    insights.push('Zone accessible aux primo-investisseurs :bonne lisibilité du marché');
  }

  // Yield traps
  if (data.yieldTraps.length > 0 && data.topGlobal.length > 0) {
    const trapRatio = data.yieldTraps.length / Math.max(data.topGlobal.length, 1);
    if (trapRatio > 0.3) {
      insights.push('Attention aux pièges à rendement :sélectivité accrue nécessaire');
    }
  }

  // Return 3 to 5 insights
  return insights.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Public API :aggregate insights
// ---------------------------------------------------------------------------

export function generateRegionInsights(region: RegionDetail): string[] {
  return buildAggregateInsights({
    avgApartmentYield: region.avgApartmentYield,
    avgRiskScore: region.avgRiskScore,
    avgGlobalScore: region.avgGlobalScore,
    avgTenantShare: region.avgTenantShare,
    avgVacancyRate: region.avgVacancyRate,
    avgMedianIncome: region.avgMedianIncome,
    avgCashflowScore: region.avgCashflowScore,
    avgPatrimonialScore: region.avgPatrimonialScore,
    avgBeginnerScore: region.avgBeginnerScore,
    topGlobal: region.topGlobal,
    yieldTraps: region.yieldTraps,
  });
}

export function generateDepartmentInsights(dept: DepartmentDetail): string[] {
  return buildAggregateInsights({
    avgApartmentYield: dept.avgApartmentYield,
    avgRiskScore: dept.avgRiskScore,
    avgGlobalScore: dept.avgGlobalScore,
    avgTenantShare: dept.avgTenantShare,
    avgVacancyRate: dept.avgVacancyRate,
    avgMedianIncome: dept.avgMedianIncome,
    avgCashflowScore: dept.avgCashflowScore,
    avgPatrimonialScore: dept.avgPatrimonialScore,
    avgBeginnerScore: dept.avgBeginnerScore,
    topGlobal: dept.topGlobal,
    yieldTraps: dept.yieldTraps,
  });
}

// ---------------------------------------------------------------------------
// Public API :city insights
// ---------------------------------------------------------------------------

export function generateCityInsights(city: CommuneDetail): string[] {
  const insights: string[] = [];
  const inv = city.investment;
  const insee = city.insee;
  const prices = city.prices;

  if (!inv) return ['Données insuffisantes pour générer des insights.'];

  // Investment profile
  const profile = inv.profile;
  if (profile === 'HIGH_YIELD' || profile === 'CASHFLOW_OPPORTUNITY') {
    insights.push('Fort potentiel de cashflow :rendement brut parmi les plus élevés du dataset');
  } else if (profile === 'PATRIMONIAL') {
    insights.push('Ville à vocation patrimoniale :valorisation long terme et sécurité du capital');
  } else if (profile === 'BEGINNER_FRIENDLY') {
    insights.push('Commune accessible aux primo-investisseurs :bon rapport accessibilité/sécurité');
  } else if (profile === 'YIELD_TRAP') {
    insights.push('Attention : profil piège à rendement :rendement apparent élevé mais risques structurels');
  } else if (profile === 'BALANCED_OPPORTUNITY') {
    insights.push('Opportunité équilibrée :bon compromis entre rendement et sécurité');
  }

  // Risk level
  if (inv.riskLevel === 'LOW') {
    insights.push('Risque faible confirmé :marché stable et prévisible');
  } else if (inv.riskLevel === 'HIGH') {
    insights.push('Risque élevé :analyse approfondie du marché local recommandée avant investissement');
  }

  // Apartment yield
  const aptYield = prices?.apartment?.grossYield;
  if (aptYield != null) {
    if (aptYield > 8) {
      insights.push(`Rendement brut appartement exceptionnel (${aptYield.toFixed(1)}%) :parmi les meilleures rentabilités`);
    } else if (aptYield >= 6) {
      insights.push(`Rendement brut appartement solide (${aptYield.toFixed(1)}%) :au-dessus de la moyenne nationale`);
    } else if (aptYield < 3) {
      insights.push(`Rendement brut faible (${aptYield.toFixed(1)}%) :logique d'investissement avant tout patrimoniale`);
    }
  }

  // Global score
  if (inv.globalScore != null) {
    if (inv.globalScore >= 70) {
      insights.push(`Score global excellent (${inv.globalScore}/100) :commune fortement recommandée pour l'investissement`);
    } else if (inv.globalScore < 35) {
      insights.push(`Score global faible (${inv.globalScore}/100) :opportunités limitées dans ce marché`);
    }
  }

  // Vacancy rate
  if (insee?.vacancyRate != null) {
    if (insee.vacancyRate > 10) {
      insights.push(`Taux de vacance élevé (${insee.vacancyRate.toFixed(1)}%) :risque de difficultés à louer`);
    } else if (insee.vacancyRate < 4) {
      insights.push(`Taux de vacance très bas (${insee.vacancyRate.toFixed(1)}%) :tension locative favorable`);
    }
  }

  // Tenant share
  if (insee?.tenantShare != null) {
    if (insee.tenantShare > 55) {
      insights.push(`Forte proportion de locataires (${Math.round(insee.tenantShare)}%) :demande locative structurellement élevée`);
    } else if (insee.tenantShare < 25) {
      insights.push(`Peu de locataires (${Math.round(insee.tenantShare)}%) :marché locatif étroit, prudence recommandée`);
    }
  }

  // Median income
  if (insee?.medianIncome != null) {
    if (insee.medianIncome > 35000) {
      insights.push(`Revenus médians élevés (${Math.round(insee.medianIncome / 1000)}k€/an) :solvabilité locataire forte`);
    } else if (insee.medianIncome < 20000) {
      insights.push(`Revenus médians faibles (${Math.round(insee.medianIncome / 1000)}k€/an) :solvabilité locataire fragile`);
    }
  }

  // Population growth
  if (insee?.populationGrowth6Y != null) {
    if (insee.populationGrowth6Y > 3) {
      insights.push('Croissance démographique positive :dynamisme local favorable à la demande locative');
    } else if (insee.populationGrowth6Y < -2) {
      insights.push('Déclin démographique :risque d\'affaiblissement de la demande locative sur le long terme');
    }
  }

  // Rental demand score
  if (inv.rentalDemandScore != null && inv.rentalDemandScore > 70) {
    insights.push('Demande locative très forte :faible risque de vacance locative');
  }

  // Long-term score
  if (inv.longTermScore != null && inv.longTermScore > 70) {
    insights.push('Excellent score long terme :commune à fort potentiel de valorisation patrimoniale');
  }

  // Return 3 to 5 insights, ensuring minimum 3
  const result = insights.slice(0, 5);
  if (result.length < 3) {
    if (inv.recommendation === 'GOOD_TO_ANALYZE') {
      result.push('Commune identifiée comme opportunité à analyser :mérite une étude de marché approfondie');
    } else if (inv.recommendation === 'TO_WATCH') {
      result.push('Commune à surveiller :potentiel en cours de développement');
    } else {
      result.push('Données partielles :investigation complémentaire recommandée avant toute décision');
    }
  }

  return result.slice(0, 5);
}
