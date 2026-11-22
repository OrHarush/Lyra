import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useDebouncedValue } from '@/hooks/common/useDebouncedValue';
import { useFetch } from '@/hooks/common/useFetch';
import type {
  HistoryRangeValue,
  InstrumentSearchDto,
  InvestmentHistoryDto,
  InvestmentPurchaseDto,
  InvestmentSummaryDto,
} from '@/types/Investment';

const MINUTE_MS = 60 * 1000;
const SUMMARY_STALE_TIME_MS = 15 * MINUTE_MS;
const HISTORY_STALE_TIME_MS = 60 * MINUTE_MS;
const SEARCH_DEBOUNCE_MS = 300;

export const useInvestmentSummary = () => {
  const query = useFetch<InvestmentSummaryDto>({
    url: API_ROUTES.INVESTMENTS.SUMMARY,
    queryKey: queryKeys.investmentSummary(),
    staleTime: SUMMARY_STALE_TIME_MS,
  });

  return { ...query, summary: query.data };
};

export const useInvestmentHistory = (range: HistoryRangeValue, symbols: string[]) => {
  const query = useFetch<InvestmentHistoryDto>({
    url: API_ROUTES.INVESTMENTS.HISTORY(range, symbols),
    queryKey: queryKeys.investmentHistory(range, symbols),
    staleTime: HISTORY_STALE_TIME_MS,
  });

  return { ...query, history: query.data };
};

export const useInvestmentPurchases = () => {
  const query = useFetch<InvestmentPurchaseDto[]>({
    url: API_ROUTES.INVESTMENTS.PURCHASES,
    queryKey: queryKeys.investmentPurchases(),
  });

  return { ...query, purchases: query.data ?? [] };
};

const NO_TRENDS: Record<string, number[]> = {};

export const usePurchaseTrends = () => {
  const query = useFetch<Record<string, number[]>>({
    url: API_ROUTES.INVESTMENTS.PURCHASE_TRENDS,
    queryKey: queryKeys.investmentPurchaseTrends(),
    staleTime: HISTORY_STALE_TIME_MS,
  });

  return { ...query, trends: query.data ?? NO_TRENDS };
};

const NO_RESULTS: InstrumentSearchDto = { israeli: [], foreign: [], foreignUnavailable: false };

export const useInstrumentSearch = (rawQuery: string) => {
  const query = useDebouncedValue(rawQuery.trim(), SEARCH_DEBOUNCE_MS);
  const result = useFetch<InstrumentSearchDto>({
    url: API_ROUTES.INVESTMENTS.INSTRUMENT_SEARCH(query),
    queryKey: queryKeys.investmentInstrumentSearch(query),
    staleTime: SUMMARY_STALE_TIME_MS,
  });

  return { ...result, results: result.data ?? NO_RESULTS };
};
