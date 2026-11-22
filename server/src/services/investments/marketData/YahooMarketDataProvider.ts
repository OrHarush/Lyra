import YahooFinance from 'yahoo-finance2';

import { addDaysIso } from '../isoDate';
import { isAgorot, normalizeCurrency, normalizePrice } from './currencyNormalization';
import {
  DailyClose,
  MarketDataError,
  MarketDataProvider,
  Quote,
  SymbolSearchResult,
} from './MarketDataProvider';

type YahooClient = InstanceType<typeof YahooFinance>;

const REQUEST_TIMEOUT_MS = 5000;
const SUPPORTED_TYPES = new Set(['ETF', 'EQUITY']);

const withTimeout = <T>(request: Promise<T>): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new MarketDataError('timeout', 'Market data request timed out')),
      REQUEST_TIMEOUT_MS
    );
  });

  return Promise.race([request, timeout]).finally(() => clearTimeout(timer));
};

const toMarketDataError = (error: unknown) => {
  if (error instanceof MarketDataError) {
    return error;
  }

  return new MarketDataError('upstream', 'Market data provider failed');
};

const guarded = async <T>(request: () => Promise<T>) => {
  try {
    return await withTimeout(request());
  } catch (error) {
    throw toMarketDataError(error);
  }
};

// Yahoo stamps daily bars at the exchange's local open; formatting in that zone keeps the calendar day right.
const toExchangeDate = (instant: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(instant);

export class YahooMarketDataProvider implements MarketDataProvider {
  constructor(
    private readonly yahoo: YahooClient = new YahooFinance({ suppressNotices: ['yahooSurvey'] })
  ) {}

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    const found = await guarded(() => this.yahoo.search(query, { quotesCount: 10, newsCount: 0 }));
    const candidates = found.quotes.flatMap(item => {
      const symbol = 'symbol' in item ? String(item.symbol) : null;
      const quoteType = 'quoteType' in item ? String(item.quoteType) : null;

      if (!symbol || !quoteType || !SUPPORTED_TYPES.has(quoteType)) {
        return [];
      }

      return [{ symbol, quoteType, item }];
    });
    const currencies = await this.fetchCurrencies(candidates.map(candidate => candidate.symbol));

    return candidates.map(({ symbol, quoteType, item }) => ({
      symbol,
      name: String(
        ('longname' in item && item.longname) || ('shortname' in item && item.shortname) || symbol
      ),
      exchange: String(
        ('exchDisp' in item && item.exchDisp) || ('exchange' in item && item.exchange) || ''
      ),
      currency: currencies[symbol] ?? null,
      type: quoteType === 'ETF' ? ('ETF' as const) : ('EQUITY' as const),
    }));
  }

  async getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
    if (symbols.length === 0) {
      return {};
    }

    const results = await guarded(() => this.yahoo.quote(symbols));
    const quotes: Record<string, Quote> = {};

    for (const result of results) {
      if (typeof result.regularMarketPrice !== 'number' || !result.currency) {
        continue;
      }

      quotes[result.symbol] = {
        price: normalizePrice(result.regularMarketPrice, result.currency),
        currency: normalizeCurrency(result.currency),
        asOf: (result.regularMarketTime ?? new Date()).toISOString(),
        name: result.longName ?? result.shortName ?? undefined,
      };
    }

    return quotes;
  }

  async getDailyCloses(symbol: string, from: string, to: string): Promise<DailyClose[]> {
    const chart = await guarded(() =>
      this.yahoo.chart(symbol, {
        period1: from,
        period2: addDaysIso(to, 1),
        interval: '1d',
      })
    );
    const timeZone = chart.meta.exchangeTimezoneName ?? 'UTC';
    const quotedInAgorot = isAgorot(chart.meta.currency ?? '');

    return chart.quotes.flatMap(bar =>
      typeof bar.close === 'number'
        ? [
            {
              date: toExchangeDate(bar.date, timeZone),
              close: quotedInAgorot ? normalizePrice(bar.close, 'ILA') : bar.close,
            },
          ]
        : []
    );
  }

  private async fetchCurrencies(symbols: string[]) {
    const quotes = await this.getQuotes(symbols).catch(() => ({}) as Record<string, Quote>);

    return Object.fromEntries(
      Object.entries(quotes).map(([symbol, quote]) => [symbol, quote.currency])
    );
  }
}
