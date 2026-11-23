import { ISRAEL_TAX_RATES_2026 } from './israel2026';
import { IsraelTaxRates } from './types';

export * from './israel2026';
export * from './types';

const ALL_RATES: IsraelTaxRates[] = [ISRAEL_TAX_RATES_2026];

export interface ResolvedRates {
  rates: IsraelTaxRates;
  isCurrent: boolean;
}

const newestRates = (): IsraelTaxRates =>
  [...ALL_RATES].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];

export const getLatestRates = (): IsraelTaxRates => newestRates();

export const resolveRates = (isoDate: string): ResolvedRates => {
  const match = ALL_RATES.find(
    rates => isoDate >= rates.effectiveFrom && isoDate <= rates.effectiveTo
  );

  if (match) {
    return { rates: match, isCurrent: true };
  }

  return { rates: newestRates(), isCurrent: false };
};

export const getAllRates = (): IsraelTaxRates[] => ALL_RATES;
