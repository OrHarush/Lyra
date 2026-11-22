import type { HistoryRangeValue } from '@lyra/shared';

export type { HistoryRangeValue };

export type InstrumentSource = 'catalog' | 'yahoo';
export type PurchaseCurrency = 'ILS' | 'USD';

export interface InvestmentPurchaseDto {
  id: string;
  source: InstrumentSource;
  instrumentId: string;
  yahooSymbol: string;
  displayName: string;
  badge: string;
  currency: PurchaseCurrency;
  date: string;
  priceDate: string;
  amount: number;
  priceAtPurchase: number;
  units: number;
  unitsSource: 'derived' | 'manual';
  note?: string;
}

export interface InvestmentPurchaseViewDto {
  id: string;
  yahooSymbol: string;
  badge: string;
  displayName: string;
  currency: PurchaseCurrency;
  date: string;
  priceDate: string;
  amount: number;
  amountIls: number | null;
  units: number;
  valueToday: number | null;
  pl: number | null;
  plPct: number | null;
  valueTodayIls: number | null;
  plIls: number | null;
  plPctIls: number | null;
}

export interface InvestmentFundDto {
  yahooSymbol: string;
  source: InstrumentSource;
  instrumentId: string;
  displayName: string;
  badge: string;
  hedged: boolean;
  currency: PurchaseCurrency;
  invested: number;
  units: number;
  currentPrice: number | null;
  value: number | null;
  pl: number | null;
  plPct: number | null;
  investedIls: number | null;
  valueIls: number | null;
  plIls: number | null;
  plPctIls: number | null;
  allocationPct: number | null;
}

export interface InvestmentTotalsDto {
  invested: number;
  value: number | null;
  pl: number | null;
  plPct: number | null;
}

export interface InvestmentSummaryDto {
  totals: InvestmentTotalsDto;
  funds: InvestmentFundDto[];
  purchases: InvestmentPurchaseViewDto[];
  usdIls: number | null;
  pricesAsOf: string | null;
  stale: boolean;
  hasMissingPrices: boolean;
  fxApproximate: boolean;
}

export interface InvestmentHistoryPointDto {
  date: string;
  invested: number;
  value: number;
}

export interface InvestmentPurchaseMarkerDto {
  id: string;
  date: string;
  yahooSymbol: string;
  amountIls: number;
}

export interface InvestmentHistoryDto {
  series: InvestmentHistoryPointDto[];
  purchases: InvestmentPurchaseMarkerDto[];
  missingSymbols: string[];
  stale: boolean;
}

export interface CatalogInstrumentDto {
  id: string;
  yahooSymbol: string;
  name: string;
  badge: string;
  issuer: string;
  index: 'S&P 500' | 'NASDAQ 100';
  hedged: boolean;
}

export interface ForeignInstrumentDto {
  symbol: string;
  name: string;
  exchange: string;
  currency: string | null;
  type: 'ETF' | 'EQUITY';
}

export interface InstrumentSearchDto {
  israeli: CatalogInstrumentDto[];
  foreign: ForeignInstrumentDto[];
  foreignUnavailable: boolean;
}
