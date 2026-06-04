export type InvestmentProfile =
  | 'YIELD_TRAP'
  | 'CASHFLOW_OPPORTUNITY'
  | 'BEGINNER_FRIENDLY'
  | 'PATRIMONIAL_SAFE'
  | 'LONG_TERM_POTENTIAL'
  | 'BALANCED_OPPORTUNITY'
  | 'LOW_INTEREST'
  | 'DATA_INCOMPLETE';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';

export type Recommendation =
  | 'STRONG_OPPORTUNITY'
  | 'GOOD_TO_ANALYZE'
  | 'ONLY_EXPERIENCED'
  | 'AVOID_FOR_BEGINNER'
  | 'AVOID'
  | 'DATA_TO_VERIFY';

export type TransportClassification =
  | 'ISOLATED'
  | 'LOW'
  | 'MODERATE'
  | 'GOOD'
  | 'EXCELLENT';

export type ContextFlag = 'top_20' | 'bottom_20' | 'middle';

export interface PropertyStats {
  average: number | null;
  min: number | null;
  max: number | null;
  rent: number | null;
  grossYield: number | null;
}

export interface CityPrices {
  apartment: PropertyStats;
  house: PropertyStats;
  all: { rent: number | null };
}

export interface CityGeo {
  inseeCode: string | null;
  lat: number | null;
  lon: number | null;
  population: number | null;
}

export interface CityInsee {
  population: number | null;
  populationGrowth6Y: number | null;
  medianIncome: number | null;
  vacancyRate: number | null;
  tenantShare: number | null;
  ownerShare: number | null;
  density: number | null;
  socioEconomicScore: number | null;
  growthScore: number | null;
  rentalMarketScore: number | null;
}

export interface NearestStation {
  name: string;
  type: string;
  distanceKm: number;
}

export interface CityTransport {
  nearestStation: NearestStation | null;
  stationsWithin5Km: number | null;
  hasMetro: boolean;
  hasRer: boolean;
  hasTrain: boolean;
  hasTram: boolean;
  transportScore: number | null;
  transportInvestmentScore: number | null;
  classification: TransportClassification | null;
  transportInsights: { summary: string } | null;
}

export interface CityInvestment {
  profile: InvestmentProfile;
  riskLevel: RiskLevel;
  globalScore: number | null;
  cashflowScore: number | null;
  beginnerScore: number | null;
  longTermScore: number | null;
  patrimonialScore: number | null;
  rentalDemandScore: number | null;
  riskScore: number | null;
  yieldScore: number | null;
  priceAccessibilityScore: number | null;
  rentPowerScore: number | null;
  socioScore: number | null;
  growthScore: number | null;
  transportScore: number | null;
  bestPropertyType: 'apartment' | 'house' | null;
  recommendation: Recommendation;
}

export interface ContextFlags {
  priceVsDataset: ContextFlag | null;
  yieldVsDataset: ContextFlag | null;
  rentVsDataset: ContextFlag | null;
  growthVsDataset: ContextFlag | null;
  vacancyVsDataset: ContextFlag | null;
  transportVsDataset: ContextFlag | null;
  incomeVsDataset: ContextFlag | null;
}

export interface CityInsights {
  tags: string[];
  strengths: string[];
  weaknesses: string[];
  verdict: string | null;
  shortVerdict: string | null;
  investorProfile: string | null;
  contextFlags: ContextFlags | null;
}

export interface City {
  city: string;
  postalCode: string;
  department: string;
  url?: string;
  prices: CityPrices;
  geo: CityGeo | null;
  insee: CityInsee | null;
  transport: CityTransport | null;
  investment: CityInvestment | null;
  insights: CityInsights | null;
}
