import type { InvestmentPurchaseViewDto } from '@/types/Investment';

export const buildPurchaseRows = (
  purchases: InvestmentPurchaseViewDto[],
  selectedSymbols: string[]
) =>
  purchases
    .filter(purchase => selectedSymbols.includes(purchase.yahooSymbol))
    .sort((a, b) => b.date.localeCompare(a.date));
