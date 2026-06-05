// Profile values returned by the API
export type InvestmentProfile =
  | 'YIELD_TRAP'
  | 'BEGINNER_FRIENDLY'
  | 'BALANCED_OPPORTUNITY'
  | 'HIGH_YIELD'
  | 'PATRIMONIAL'
  | 'DEFAULT';

// API returns LOW | MEDIUM | HIGH
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// API recommendation values
export type Recommendation =
  | 'GOOD_TO_ANALYZE'
  | 'TO_WATCH'
  | 'NOT_RECOMMENDED';

export type TransportClassification =
  | 'ISOLATED'
  | 'LOW'
  | 'MODERATE'
  | 'GOOD'
  | 'EXCELLENT';

export type ContextFlag = 'top_20' | 'bottom_20' | 'middle';

export interface ContextFlags {
  priceVsDataset: ContextFlag | null;
  yieldVsDataset: ContextFlag | null;
  rentVsDataset: ContextFlag | null;
  growthVsDataset: ContextFlag | null;
  vacancyVsDataset: ContextFlag | null;
  transportVsDataset: ContextFlag | null;
  incomeVsDataset: ContextFlag | null;
}

// City = CommuneDetail from the API (full data, fetched per city)
export interface City {
  city: string;
  postalCode: string;
  department: string;
  population: number;

  geo: {
    inseeCode: string;
    apiName: string;
    lat: number;
    lon: number;
    population: number;
    surface: number | null;
    densityRaw: number | null;
    matchScore: number;
    matchStrategy: string;
  } | null;

  prices: {
    apartment: {
      average: number;
      min: number;
      max: number;
      rent: number;
      grossYield: number;
    } | null;
    house: {
      average: number;
      min: number;
      max: number;
      rent: number;
      grossYield: number;
    } | null;
    all: { rent: number } | null;
  } | null;

  priceSources: {
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    priceReliabilityIndex: {
      score: number;
      grade: 'A' | 'B' | 'C';
      confidence: string;
    };
  } | null;

  insee: {
    status?: string;
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
  } | null;

  transport: {
    status?: string;
    nearestStation: { name: string; type: string; distanceKm: number } | null;
    nearestRer: { name: string; distanceKm: number } | null;
    nearestTrain: { name: string; distanceKm: number } | null;
    nearestMetro: { name: string; distanceKm: number } | null;
    nearestTram: { name: string; distanceKm: number } | null;
    stationsWithin2Km: number;
    stationsWithin5Km: number;
    stationsWithin10Km: number;
    hasMetro: boolean;
    hasRer: boolean;
    hasTrain: boolean;
    hasTram: boolean;
    transportScore: number | null;
    transportInvestmentScore: number | null;
    classification: TransportClassification | null;
    transportInsights: { summary: string; strengths?: string[]; weaknesses?: string[] } | null;
    futureProjects: { grandParis: boolean; newStationPlanned: boolean; futureTransportScore: number | null } | null;
  } | null;

  investment: {
    profile: InvestmentProfile | string;
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
    recommendation: Recommendation | string;
  } | null;

  insights: {
    tags: string[];
    strengths: string[];
    weaknesses: string[];
    verdict: string | null;
    shortVerdict: string | null;
    investorProfile: string | null;
    contextFlags: ContextFlags | null;
  } | null;
}
