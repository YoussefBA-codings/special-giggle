export interface CommuneIndex {
  inseeCode: string;
  city: string;
  postalCode: string;
  department: string;
  departmentName: string;
  region: string;
  regionSlug: string;
  lat: number | null;
  lon: number | null;
  population: number;
  apartmentPrice: number | null;
  housePrice: number | null;
  apartmentRent: number | null;
  houseRent: number | null;
  apartmentYield: number | null;
  houseYield: number | null;
  dataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  globalScore: number;
  cashflowScore: number;
  yieldScore: number;
  beginnerScore: number;
  patrimonialScore: number;
  riskScore: number;
  longTermScore: number;
  rentalDemandScore: number;
  profile: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  tags: string[];
  shortVerdict: string;
  medianIncome: number | null;
  distanceToStation: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RankingResult {
  ranking: string;
  description: string;
  total: number;
  communes: CommuneIndex[];
}

export interface RegionSummary {
  slug: string;
  name: string;
  departmentCodes: string[];
  communesCount: number;
  population: number;
  avgGlobalScore: number;
  avgApartmentYield: number | null;
  avgApartmentPrice: number | null;
}

export interface RegionDetail extends RegionSummary {
  avgHousePrice: number | null;
  avgApartmentRent: number | null;
  avgHouseRent: number | null;
  avgApartmentYield: number | null;
  avgHouseYield: number | null;
  avgYieldScore: number;
  avgCashflowScore: number;
  avgPatrimonialScore: number;
  avgBeginnerScore: number;
  avgRiskScore: number;
  avgVacancyRate: number | null;
  avgTenantShare: number | null;
  avgMedianIncome: number | null;
  generatedAt: string;
  topGlobal: CommuneIndex[];
  topYield: CommuneIndex[];
  topCashflow: CommuneIndex[];
  topPatrimonial: CommuneIndex[];
  topBeginner: CommuneIndex[];
  lowRisk: CommuneIndex[];
  yieldTraps: CommuneIndex[];
}

export interface DepartmentSummary {
  code: string;
  name: string;
  regionSlug: string;
  regionName: string;
  communesCount: number;
  population: number;
  avgGlobalScore: number;
  avgApartmentYield: number | null;
  avgApartmentPrice: number | null;
}

export type DepartmentListItem = DepartmentSummary;

export interface DepartmentDetail extends DepartmentSummary {
  avgHousePrice: number | null;
  avgApartmentRent: number | null;
  avgHouseRent: number | null;
  avgApartmentYield: number | null;
  avgHouseYield: number | null;
  avgYieldScore: number;
  avgCashflowScore: number;
  avgPatrimonialScore: number;
  avgBeginnerScore: number;
  avgRiskScore: number;
  avgVacancyRate: number | null;
  avgTenantShare: number | null;
  avgMedianIncome: number | null;
  generatedAt: string;
  topGlobal: CommuneIndex[];
  topYield: CommuneIndex[];
  topCashflow: CommuneIndex[];
  topPatrimonial: CommuneIndex[];
  topBeginner: CommuneIndex[];
  lowRisk: CommuneIndex[];
  yieldTraps: CommuneIndex[];
}

export interface CommuneDetail {
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
    surface: number;
    densityRaw: number;
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
    all: {
      rent: number;
    } | null;
  } | null;
  priceSources: {
    dataQuality: 'HIGH' | 'MEDIUM' | 'LOW' | null;
    priceReliabilityIndex: {
      score: number;
      grade: string;
      confidence: string;
    };
  } | null;
  insee: {
    status?: string;
    error?: string | null;
    population: number;
    populationGrowth6Y: number | null;
    medianIncome: number | null;
    vacancyRate: number | null;
    tenantShare: number | null;
    ownerShare: number | null;
    density: number | null;
    socioEconomicScore: number;
    growthScore: number;
    rentalMarketScore: number;
    dataYear?: {
      population?: number;
      income?: number;
      housing?: number;
    } | null;
  } | null;
  transport: {
    status?: string;
    error?: string | null;
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
    transportScore: number;
    transportInvestmentScore: number;
    classification: string;
    transportInsights: {
      strengths: string[];
      weaknesses: string[];
      summary: string;
    } | null;
    futureProjects: {
      grandParis: boolean;
      newStationPlanned: boolean;
      futureTransportScore: number | null;
    } | null;
  } | null;
  investment: {
    profile: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    globalScore: number;
    cashflowScore: number;
    beginnerScore: number;
    longTermScore: number;
    patrimonialScore: number;
    rentalDemandScore: number;
    riskScore: number;
    yieldScore: number;
    priceAccessibilityScore: number;
    rentPowerScore: number;
    socioScore: number;
    growthScore: number;
    transportScore: number;
    bestPropertyType: string;
    recommendation: string;
  } | null;
  insights: {
    tags: string[];
    strengths: string[];
    weaknesses: string[];
    verdict: string;
    shortVerdict: string;
    investorProfile: string;
    contextFlags: Record<string, string> | null;
  } | null;
}
