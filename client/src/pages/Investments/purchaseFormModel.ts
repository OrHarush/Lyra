import type { CreateInvestmentPurchaseDTO, UpdateInvestmentPurchaseDTO } from '@lyra/shared';
import axios from 'axios';
import dayjs from 'dayjs';

import type {
  CatalogInstrumentDto,
  ForeignInstrumentDto,
  InstrumentSource,
  InvestmentPurchaseDto,
  PurchaseCurrency,
} from '@/types/Investment';

export interface FundOption {
  source: InstrumentSource;
  instrumentId: string;
  name: string;
  badge: string;
  currency: PurchaseCurrency;
  isHedged: boolean;
  exchange: string;
}

export const fromCatalogInstrument = (instrument: CatalogInstrumentDto): FundOption => ({
  source: 'catalog',
  instrumentId: instrument.id,
  name: instrument.name,
  badge: instrument.badge,
  currency: 'ILS',
  isHedged: instrument.hedged,
  exchange: '',
});

export const fromForeignInstrument = (instrument: ForeignInstrumentDto): FundOption => ({
  source: 'yahoo',
  instrumentId: instrument.symbol,
  name: instrument.name,
  badge: instrument.symbol,
  currency: 'USD',
  isHedged: false,
  exchange: instrument.exchange,
});

export interface PurchaseFormValues {
  fund: FundOption | null;
  date: string;
  amount: number | null;
  units: number | null;
}

export type PurchaseFormField = 'fund' | 'date';

const SERVER_ERROR_PREFIX = 'investments.errors.';

const ERROR_FIELDS: Record<string, PurchaseFormField> = {
  symbolNotFound: 'fund',
  instrumentNotFound: 'fund',
  unsupportedCurrency: 'fund',
  futureDate: 'date',
  invalidDate: 'date',
  noPriceForDate: 'date',
};

export const buildDefaultValues = (purchase?: InvestmentPurchaseDto): PurchaseFormValues => {
  if (!purchase) {
    return { fund: null, date: dayjs().format('YYYY-MM-DD'), amount: null, units: null };
  }

  return {
    fund: {
      source: purchase.source,
      instrumentId: purchase.instrumentId,
      name: purchase.displayName,
      badge: purchase.badge,
      currency: purchase.currency,
      isHedged: false,
      exchange: '',
    },
    date: purchase.date,
    amount: purchase.amount,
    units: purchase.unitsSource === 'manual' ? purchase.units : null,
  };
};

export const toCreateInput = (values: PurchaseFormValues): CreateInvestmentPurchaseDTO => ({
  source: (values.fund as FundOption).source,
  instrumentId: (values.fund as FundOption).instrumentId,
  date: values.date,
  amount: values.amount as number,
  ...(values.units ? { units: values.units } : {}),
});

// Clearing a manual units value must be sent as null, otherwise the server keeps the old units.
export const toUpdateInput = (
  values: PurchaseFormValues,
  existing: InvestmentPurchaseDto
): UpdateInvestmentPurchaseDTO => {
  const wasManual = existing.unitsSource === 'manual';
  const units = values.units ? values.units : wasManual ? null : undefined;

  return {
    source: (values.fund as FundOption).source,
    instrumentId: (values.fund as FundOption).instrumentId,
    date: values.date,
    amount: values.amount as number,
    ...(units !== undefined ? { units } : {}),
  };
};

export const readServerErrorKey = (error: unknown) => {
  const message = axios.isAxiosError(error) ? String(error.response?.data?.error ?? '') : '';

  return message.startsWith(SERVER_ERROR_PREFIX) ? message.slice(SERVER_ERROR_PREFIX.length) : '';
};

export const fieldForServerError = (errorKey: string): PurchaseFormField | null =>
  ERROR_FIELDS[errorKey] ?? null;
