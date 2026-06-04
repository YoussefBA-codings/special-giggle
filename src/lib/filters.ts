import type { City } from '../types/city';
import type { Filters } from '../types/filters';
import { n } from './formatters';

export function applyFilters(cities: City[], filters: Filters): City[] {
  return cities.filter((city) => {
    const inv = city.investment;
    const ins = city.insee;
    const tr = city.transport;
    const apt = city.prices.apartment;
    const house = city.prices.house;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inCity = city.city.toLowerCase().includes(q);
      const inDept = city.department.includes(q);
      const inPostal = city.postalCode.includes(q);
      const inTags = city.insights?.tags?.some((t) => t.toLowerCase().includes(q));
      const inProfile = inv?.profile?.toLowerCase().includes(q);
      if (!inCity && !inDept && !inPostal && !inTags && !inProfile) return false;
    }

    if (filters.department && city.department !== filters.department) return false;
    if (filters.profile && inv?.profile !== filters.profile) return false;
    if (filters.recommendation && inv?.recommendation !== filters.recommendation) return false;
    if (filters.riskLevel && inv?.riskLevel !== filters.riskLevel) return false;
    if (filters.bestPropertyType && inv?.bestPropertyType !== filters.bestPropertyType) return false;
    if (filters.transportClassification && tr?.classification !== filters.transportClassification) return false;

    if (filters.selectedTags.length > 0) {
      const cityTags = city.insights?.tags ?? [];
      if (!filters.selectedTags.every((t) => cityTags.includes(t))) return false;
    }

    const aptYield = n(apt.grossYield);
    const houseYield = n(house.grossYield);
    const bestYield = Math.max(aptYield, houseYield);
    const aptPrice = n(apt.average);
    const housePrice = n(house.average);

    if (filters.minYield > 0 && bestYield < filters.minYield) return false;
    if (filters.maxYield > 0 && bestYield > filters.maxYield) return false;
    if (filters.maxPrice > 0) {
      const minPrice = Math.min(aptPrice || 99999, housePrice || 99999);
      if (minPrice > filters.maxPrice) return false;
    }
    if (filters.minRent > 0 && n(apt.rent) < filters.minRent && n(house.rent) < filters.minRent) return false;
    if (filters.maxVacancy > 0 && n(ins?.vacancyRate) > filters.maxVacancy) return false;
    if (filters.minPopulation > 0 && n(ins?.population) < filters.minPopulation) return false;
    if (filters.minIncome > 0 && n(ins?.medianIncome) < filters.minIncome) return false;
    if (filters.minGrowth > -999 && n(ins?.populationGrowth6Y) < filters.minGrowth) return false;
    if (filters.maxStationDistance > 0 && n(tr?.nearestStation?.distanceKm) > filters.maxStationDistance) return false;
    if (filters.minGlobalScore > 0 && n(inv?.globalScore) < filters.minGlobalScore) return false;
    if (filters.minCashflowScore > 0 && n(inv?.cashflowScore) < filters.minCashflowScore) return false;
    if (filters.minBeginnerScore > 0 && n(inv?.beginnerScore) < filters.minBeginnerScore) return false;
    if (filters.minPatrimonialScore > 0 && n(inv?.patrimonialScore) < filters.minPatrimonialScore) return false;

    if (filters.excludeYieldTrap && inv?.profile === 'YIELD_TRAP') return false;
    if (filters.excludeIsolated && tr?.classification === 'ISOLATED') return false;
    if (filters.beginnerOnly && n(inv?.beginnerScore) < 40) return false;
    if (filters.cashflowOnly && n(inv?.cashflowScore) < 50) return false;

    return true;
  });
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search !== '' ||
    filters.department !== '' ||
    filters.profile !== '' ||
    filters.recommendation !== '' ||
    filters.riskLevel !== '' ||
    filters.bestPropertyType !== '' ||
    filters.transportClassification !== '' ||
    filters.selectedTags.length > 0 ||
    filters.minYield > 0 ||
    filters.maxYield > 0 ||
    filters.maxPrice > 0 ||
    filters.minRent > 0 ||
    filters.maxVacancy > 0 ||
    filters.minPopulation > 0 ||
    filters.minIncome > 0 ||
    filters.minGrowth > -999 ||
    filters.maxStationDistance > 0 ||
    filters.minGlobalScore > 0 ||
    filters.minCashflowScore > 0 ||
    filters.minBeginnerScore > 0 ||
    filters.minPatrimonialScore > 0 ||
    filters.excludeYieldTrap ||
    filters.excludeIsolated ||
    filters.beginnerOnly ||
    filters.cashflowOnly
  );
}
