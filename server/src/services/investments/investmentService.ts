import {
  CatalogEntry,
  findCatalogEntryById,
  findCatalogEntryBySymbol,
  INSTRUMENT_CATALOG,
  searchCatalog,
} from '../../config/instrumentCatalog';
import { ApiError } from '../../errors/ApiError';
import { AnalyticsEventType } from '../../models/AnalyticsEvent';
import {
  InstrumentSource,
  InvestmentPurchase,
  PurchaseCurrency,
} from '../../models/InvestmentPurchase';
import * as purchaseRepository from '../../repositories/investmentPurchaseRepository';
import { NewInvestmentPurchase } from '../../repositories/investmentPurchaseRepository';
import * as analyticsService from '../analyticsService';
import { addDaysIso, addMonthsIso, isIsoDate, todayIso } from './isoDate';
import { MarketDataCache } from './marketData/MarketDataCache';
import { MarketDataGateway } from './marketData/MarketDataGateway';
import { MarketDataError, SymbolSearchResult } from './marketData/MarketDataProvider';
import { YahooMarketDataProvider } from './marketData/YahooMarketDataProvider';
import {
  buildFxRates,
  buildHistorySeries,
  buildPurchaseMarkers,
  buildSummary,
  computePosition,
  downsampleEvenly,
  downsampleWeekly,
  HistoryPoint,
  PortfolioSummary,
  PriceQuote,
  PurchaseMarker,
  resolveCloseOnOrBefore,
} from './portfolioMath';

export const INVESTMENT_ERRORS = {
  symbolNotFound: 'investments.errors.symbolNotFound',
  unsupportedCurrency: 'investments.errors.unsupportedCurrency',
  instrumentNotFound: 'investments.errors.instrumentNotFound',
  futureDate: 'investments.errors.futureDate',
  invalidDate: 'investments.errors.invalidDate',
  noPriceForDate: 'investments.errors.noPriceForDate',
  purchaseNotFound: 'investments.errors.purchaseNotFound',
  marketDataUnavailable: 'investments.errors.marketDataUnavailable',
} as const;

const FOREIGN_CURRENCY = 'USD';
const FX_SYMBOL = 'USDILS=X';
const PRICE_LOOKBACK_DAYS = 7;
const SEED_LOOKBACK_DAYS = 7;
const MIN_FOREIGN_SEARCH_LENGTH = 2;
// Users east of UTC can legitimately be a calendar day ahead of the server.
const FUTURE_TOLERANCE_DAYS = 1;

export type HistoryRange = '3M' | '1Y' | 'ALL';

export interface CreatePurchaseInput {
  source: InstrumentSource;
  instrumentId: string;
  date: string;
  amount: number;
  units?: number;
  note?: string;
}

export interface UpdatePurchaseInput {
  source?: InstrumentSource;
  instrumentId?: string;
  date?: string;
  amount?: number;
  units?: number | null;
  note?: string | null;
}

export interface HistoryQuery {
  range: HistoryRange;
  symbols?: string[];
}

export interface PortfolioHistory {
  series: HistoryPoint[];
  purchases: PurchaseMarker[];
  missingSymbols: string[];
  stale: boolean;
}

export interface InstrumentSearchResult {
  israeli: CatalogEntry[];
  foreign: SymbolSearchResult[];
  foreignUnavailable: boolean;
}

export interface InvestmentServiceDeps {
  purchases: Pick<
    typeof purchaseRepository,
    'insert' | 'findAllByUser' | 'findOneByUser' | 'updateOneByUser' | 'deleteOneByUser'
  >;
  market: MarketDataGateway;
  now: () => Date;
  catalog?: CatalogEntry[];
  track?: (userId: string, event: AnalyticsEventType) => void;
}

interface ResolvedInstrument {
  source: InstrumentSource;
  instrumentId: string;
  yahooSymbol: string;
  displayName: string;
  badge: string;
  currency: PurchaseCurrency;
}

interface PurchaseDraft {
  source: InstrumentSource;
  instrumentId: string;
  date: string;
  amount: number;
  manualUnits?: number;
  note?: string;
}

export const createInvestmentService = ({
  purchases,
  market,
  now,
  catalog = INSTRUMENT_CATALOG,
  track = () => undefined,
}: InvestmentServiceDeps) => {
  const today = () => todayIso(now());

  const rejectUnlessPlausibleDate = (date: string) => {
    if (!isIsoDate(date)) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.invalidDate);
    }

    if (date > addDaysIso(today(), FUTURE_TOLERANCE_DAYS)) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.futureDate);
    }
  };

  const guardMarketData = async <T>(request: () => Promise<T>) => {
    try {
      return await request();
    } catch (error) {
      if (error instanceof MarketDataError) {
        throw ApiError.serviceUnavailable(INVESTMENT_ERRORS.marketDataUnavailable);
      }

      throw error;
    }
  };

  const resolveCatalogInstrument = (instrumentId: string): ResolvedInstrument => {
    const entry = findCatalogEntryById(catalog, instrumentId);

    if (!entry) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.instrumentNotFound);
    }

    return {
      source: 'catalog',
      instrumentId: entry.id,
      yahooSymbol: entry.yahooSymbol,
      displayName: entry.name,
      badge: entry.badge,
      currency: entry.currency,
    };
  };

  const resolveYahooInstrument = async (instrumentId: string): Promise<ResolvedInstrument> => {
    const symbol = normalizeSymbol(instrumentId);
    const quote = await guardMarketData(() => market.lookupQuote(symbol));

    if (!quote) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.symbolNotFound);
    }

    if (quote.currency.toUpperCase() !== FOREIGN_CURRENCY) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.unsupportedCurrency);
    }

    return {
      source: 'yahoo',
      instrumentId: symbol,
      yahooSymbol: symbol,
      displayName: quote.name ?? symbol,
      badge: bareSymbol(symbol),
      currency: FOREIGN_CURRENCY,
    };
  };

  const resolveInstrument = (source: InstrumentSource, instrumentId: string) =>
    source === 'catalog'
      ? resolveCatalogInstrument(instrumentId)
      : resolveYahooInstrument(instrumentId);

  const resolveClose = async (yahooSymbol: string, date: string) => {
    const closes = await guardMarketData(() =>
      market.lookupDailyCloses(yahooSymbol, addDaysIso(date, -PRICE_LOOKBACK_DAYS), date)
    );
    const close = resolveCloseOnOrBefore(closes, date);

    if (!close) {
      throw ApiError.badRequest(INVESTMENT_ERRORS.noPriceForDate);
    }

    return close;
  };

  const buildNewPurchase = async (
    userId: string,
    draft: PurchaseDraft
  ): Promise<NewInvestmentPurchase> => {
    const instrument = await resolveInstrument(draft.source, draft.instrumentId);
    const close = await resolveClose(instrument.yahooSymbol, draft.date);
    const position = computePosition(draft.amount, close.close, draft.manualUnits);

    return {
      userId,
      ...instrument,
      date: draft.date,
      priceDate: close.date,
      amount: draft.amount,
      ...position,
      note: draft.note ?? '',
    };
  };

  const searchInstruments = async (query: string): Promise<InstrumentSearchResult> => {
    const trimmed = query.trim();
    const israeli = searchCatalog(catalog, trimmed);

    if (trimmed.length < MIN_FOREIGN_SEARCH_LENGTH) {
      return { israeli, foreign: [], foreignUnavailable: false };
    }

    try {
      const found = await market.searchSymbols(trimmed);
      const foreign = found.filter(
        result =>
          result.currency === FOREIGN_CURRENCY && !findCatalogEntryBySymbol(catalog, result.symbol)
      );

      return { israeli, foreign, foreignUnavailable: false };
    } catch {
      return { israeli, foreign: [], foreignUnavailable: true };
    }
  };

  const createPurchase = async (userId: string, input: CreatePurchaseInput) => {
    rejectUnlessPlausibleDate(input.date);

    const created = await purchases.insert(
      await buildNewPurchase(userId, { ...input, manualUnits: input.units })
    );

    track(userId, 'investment_purchase_created');

    return created;
  };

  const findOwnedPurchase = async (userId: string, id: string) => {
    const existing = await purchases.findOneByUser(userId, id);

    if (!existing) {
      throw ApiError.notFound(INVESTMENT_ERRORS.purchaseNotFound);
    }

    return existing;
  };

  const updatePurchase = async (userId: string, id: string, input: UpdatePurchaseInput) => {
    const existing = await findOwnedPurchase(userId, id);
    const draft = mergeIntoDraft(existing, input);

    if (input.date !== undefined) {
      rejectUnlessPlausibleDate(input.date);
    }

    const rebuilt = needsMarketLookup(existing, draft)
      ? await buildNewPurchase(userId, draft)
      : repriceFromStored(existing, draft);
    const updated = await purchases.updateOneByUser(userId, id, withoutUserId(rebuilt));

    if (!updated) {
      throw ApiError.notFound(INVESTMENT_ERRORS.purchaseNotFound);
    }

    return updated;
  };

  const deletePurchase = async (userId: string, id: string) => {
    const deleted = await purchases.deleteOneByUser(userId, id);

    if (!deleted) {
      throw ApiError.notFound(INVESTMENT_ERRORS.purchaseNotFound);
    }

    track(userId, 'investment_purchase_deleted');
  };

  const listPurchases = (userId: string) => purchases.findAllByUser(userId);

  const loadFxCloses = async (fromDate: string) => {
    try {
      return await market.getDailyCloses(
        FX_SYMBOL,
        addDaysIso(fromDate, -SEED_LOOKBACK_DAYS),
        today()
      );
    } catch {
      return null;
    }
  };

  // Counted here rather than via a client ping; the client's 15-minute staleTime bounds refetch inflation.
  const getSummary = async (userId: string): Promise<PortfolioSummary> => {
    track(userId, 'investments_page_viewed');

    const all = await purchases.findAllByUser(userId);
    const noRates = buildFxRates(null, null, false);

    if (all.length === 0) {
      return buildSummary([], {}, noRates);
    }

    const symbols = [...new Set(all.map(purchase => purchase.yahooSymbol))];
    const usdPurchases = all.filter(purchase => purchase.currency === 'USD');
    const quotes = await market.getQuotes(
      usdPurchases.length > 0 ? [...symbols, FX_SYMBOL] : symbols
    );
    const fxHistory =
      usdPurchases.length > 0
        ? await loadFxCloses(usdPurchases.map(purchase => purchase.date).sort()[0])
        : null;
    const fx = buildFxRates(
      quotes[FX_SYMBOL]?.price ?? null,
      fxHistory?.closes ?? null,
      Boolean(quotes[FX_SYMBOL]?.stale || fxHistory?.stale)
    );
    const summary = buildSummary(all, toPriceQuotes(quotes, symbols), fx);

    return {
      ...summary,
      funds: summary.funds.map(fund => withCatalogPresentation(fund, catalog)),
      purchases: summary.purchases.map(purchase => {
        const entry = findCatalogEntryBySymbol(catalog, purchase.yahooSymbol);

        return entry ? { ...purchase, displayName: entry.name, badge: entry.badge } : purchase;
      }),
    };
  };

  const getHistory = async (userId: string, query: HistoryQuery): Promise<PortfolioHistory> => {
    const all = await purchases.findAllByUser(userId);
    const selected = filterBySymbols(all, query.symbols);

    if (selected.length === 0) {
      return { series: [], purchases: [], missingSymbols: [], stale: false };
    }

    const from = resolveRangeStart(query.range, selected, today());
    const usd = selected.filter(purchase => purchase.currency === 'USD');
    const fxFrom = [from, ...usd.map(purchase => purchase.date)].sort()[0];
    const fxHistory = usd.length > 0 ? await loadFxCloses(fxFrom) : null;
    const symbols = [...new Set(selected.map(purchase => purchase.yahooSymbol))];
    const loaded = await Promise.all(symbols.map(symbol => loadCloses(symbol, from)));
    const failed = loaded.filter(entry => entry.closes === null).map(entry => entry.symbol);
    const usdSymbols = new Set(usd.map(purchase => purchase.yahooSymbol));
    const missingSymbols = fxHistory ? failed : [...new Set([...failed, ...usdSymbols])];
    const included = selected.filter(purchase => !missingSymbols.includes(purchase.yahooSymbol));
    const usable = loaded.filter(
      entry => entry.closes !== null && !missingSymbols.includes(entry.symbol)
    );
    const closesBySymbol = new Map(usable.map(entry => [entry.symbol, entry.closes!]));
    const fxCloses = fxHistory?.closes ?? null;

    return {
      series: downsampleWeekly(buildHistorySeries(included, closesBySymbol, fxCloses, from)),
      purchases: buildPurchaseMarkers(
        included.filter(purchase => purchase.date >= from),
        fxCloses
      ),
      missingSymbols,
      stale: usable.some(entry => entry.stale) || Boolean(fxHistory?.stale),
    };
  };

  // A purchase without usable prices (or without FX for a dollar fund) simply has no trend, never a wrong one.
  const getPurchaseTrends = async (userId: string): Promise<Record<string, number[]>> => {
    const all = await purchases.findAllByUser(userId);

    if (all.length === 0) {
      return {};
    }

    const earliest = all.map(purchase => purchase.date).sort()[0];
    const hasUsd = all.some(purchase => purchase.currency === 'USD');
    const fxCloses = hasUsd ? ((await loadFxCloses(earliest))?.closes ?? null) : null;
    const symbols = [...new Set(all.map(purchase => purchase.yahooSymbol))];
    const loaded = await Promise.all(symbols.map(symbol => loadCloses(symbol, earliest)));
    const closesBySymbol = new Map(
      loaded.flatMap(entry => (entry.closes ? [[entry.symbol, entry.closes] as const] : []))
    );

    return Object.fromEntries(
      all.flatMap(purchase => {
        const closes = closesBySymbol.get(purchase.yahooSymbol);

        if (!closes || (purchase.currency === 'USD' && !fxCloses)) {
          return [];
        }

        const series = buildHistorySeries(
          [purchase],
          new Map([[purchase.yahooSymbol, closes]]),
          fxCloses,
          purchase.date
        );

        return [[purchase.id, downsampleEvenly(series.map(point => point.value))]];
      })
    );
  };

  const loadCloses = async (symbol: string, from: string) => {
    try {
      const { closes, stale } = await market.getDailyCloses(
        symbol,
        addDaysIso(from, -SEED_LOOKBACK_DAYS),
        today()
      );

      return { symbol, closes, stale };
    } catch {
      return { symbol, closes: null, stale: false };
    }
  };

  return {
    searchInstruments,
    createPurchase,
    updatePurchase,
    deletePurchase,
    listPurchases,
    getSummary,
    getHistory,
    getPurchaseTrends,
  };
};

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

const bareSymbol = (symbol: string) => symbol.split('.')[0];

const withoutUserId = ({ userId: _userId, ...changes }: NewInvestmentPurchase) => changes;

// Catalog funds render from the catalog while their entry exists; the stored snapshot is the fallback.
const withCatalogPresentation = <
  T extends {
    source: InstrumentSource;
    instrumentId: string;
    displayName: string;
    badge: string;
    hedged: boolean;
  },
>(
  fund: T,
  catalog: CatalogEntry[]
): T => {
  const entry =
    fund.source === 'catalog' ? findCatalogEntryById(catalog, fund.instrumentId) : undefined;

  return entry
    ? { ...fund, displayName: entry.name, badge: entry.badge, hedged: entry.hedged }
    : fund;
};

const needsMarketLookup = (existing: InvestmentPurchase, draft: PurchaseDraft) => {
  const instrumentChanged =
    draft.source !== existing.source || draft.instrumentId !== existing.instrumentId;
  const dateChanged = draft.date !== existing.date;
  const losesManualUnits = existing.unitsSource === 'manual' && draft.manualUnits === undefined;

  return instrumentChanged || dateChanged || losesManualUnits;
};

const repriceFromStored = (
  existing: InvestmentPurchase,
  draft: PurchaseDraft
): NewInvestmentPurchase => {
  const stored: Omit<InvestmentPurchase, 'id'> & { id?: string } = { ...existing };

  delete stored.id;

  return {
    ...stored,
    amount: draft.amount,
    ...computePosition(draft.amount, existing.priceAtPurchase, draft.manualUnits),
    note: draft.note ?? '',
  };
};

const mergeIntoDraft = (
  existing: InvestmentPurchase,
  input: UpdatePurchaseInput
): PurchaseDraft => {
  const keepsManualUnits = existing.unitsSource === 'manual' && input.units === undefined;
  const changesInstrument = input.source !== undefined && input.instrumentId !== undefined;

  return {
    source: changesInstrument ? (input.source as InstrumentSource) : existing.source,
    instrumentId: changesInstrument ? (input.instrumentId as string) : existing.instrumentId,
    date: input.date ?? existing.date,
    amount: input.amount ?? existing.amount,
    manualUnits: keepsManualUnits ? existing.units : (input.units ?? undefined),
    note: input.note === undefined ? existing.note : (input.note ?? undefined),
  };
};

const filterBySymbols = (all: InvestmentPurchase[], symbols?: string[]) => {
  if (!symbols || symbols.length === 0) {
    return all;
  }

  const wanted = new Set(symbols.map(normalizeSymbol));

  return all.filter(purchase => wanted.has(purchase.yahooSymbol));
};

const resolveRangeStart = (range: HistoryRange, selected: InvestmentPurchase[], today: string) => {
  const earliestPurchase = selected.map(purchase => purchase.date).sort()[0];

  if (range === 'ALL') {
    return earliestPurchase;
  }

  const rangeStart = addMonthsIso(today, range === '3M' ? -3 : -12);

  return earliestPurchase > rangeStart ? earliestPurchase : rangeStart;
};

const toPriceQuotes = (
  quotes: Record<string, { price: number; asOf: string; stale: boolean }>,
  symbols: string[]
): Record<string, PriceQuote> =>
  Object.fromEntries(symbols.flatMap(symbol => (quotes[symbol] ? [[symbol, quotes[symbol]]] : [])));

export const marketDataGateway = new MarketDataGateway(
  new YahooMarketDataProvider(),
  new MarketDataCache()
);

export const investmentService = createInvestmentService({
  purchases: purchaseRepository,
  market: marketDataGateway,
  now: () => new Date(),
  track: (userId, event) =>
    void analyticsService
      .track(userId, event)
      .catch(err => console.error(`Failed to track ${event}:`, err)),
});
