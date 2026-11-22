import { CachedValue, MarketDataCache } from './MarketDataCache';
import { DailyClose, MarketDataProvider, Quote } from './MarketDataProvider';

const QUOTE_TTL_MS = 15 * 60 * 1000;
const HISTORY_TTL_MS = 6 * 60 * 60 * 1000;

export interface QuoteResult extends Quote {
  stale: boolean;
}

export interface HistoryResult {
  closes: DailyClose[];
  stale: boolean;
}

export class MarketDataGateway {
  constructor(
    private readonly provider: MarketDataProvider,
    private readonly cache: MarketDataCache = new MarketDataCache()
  ) {}

  // Symbols the provider could not price are simply absent, so one bad symbol never fails the batch.
  async getQuotes(symbols: string[]): Promise<Record<string, QuoteResult>> {
    const unique = [...new Set(symbols)];
    const toFetch = unique.filter(
      symbol => !this.cache.isFresh(quoteKey(symbol)) && !this.cache.isLoading(quoteKey(symbol))
    );
    const fetchBatch = once(() => this.provider.getQuotes(toFetch));
    const settled = await Promise.all(
      unique.map(symbol => this.loadQuote(symbol, fetchBatch).catch(() => null))
    );

    return Object.fromEntries(
      unique.flatMap((symbol, index) => {
        const result = settled[index];

        return result ? [[symbol, { ...result.value, stale: result.stale }]] : [];
      })
    );
  }

  async getDailyCloses(symbol: string, from: string, to: string): Promise<HistoryResult> {
    const result = await this.cache.getOrLoad(historyKey(symbol, from), HISTORY_TTL_MS, () =>
      this.provider.getDailyCloses(symbol, from, to)
    );

    return { closes: result.value, stale: result.stale };
  }

  searchSymbols(query: string) {
    return this.provider.searchSymbols(query);
  }

  // Throws on provider outage so callers can tell "unknown symbol" (null) from "Yahoo is down".
  async lookupQuote(symbol: string): Promise<Quote | null> {
    const quotes = await this.provider.getQuotes([symbol]);

    return quotes[symbol] ?? null;
  }

  // Uncached on purpose: a purchase's price lookup is a one-off window that must reflect the provider's data.
  async lookupDailyCloses(symbol: string, from: string, to: string) {
    return this.provider.getDailyCloses(symbol, from, to);
  }

  private loadQuote(
    symbol: string,
    fetchBatch: () => Promise<Record<string, Quote>>
  ): Promise<CachedValue<Quote>> {
    return this.cache.getOrLoad(quoteKey(symbol), QUOTE_TTL_MS, async () => {
      const batch = await fetchBatch();

      if (!batch[symbol]) {
        throw new Error('Symbol missing from provider response');
      }

      return batch[symbol];
    });
  }
}

const quoteKey = (symbol: string) => `quote:${symbol}`;
const historyKey = (symbol: string, from: string) => `history:${symbol}:${from}`;

const once = <T>(factory: () => Promise<T>) => {
  let pending: Promise<T> | undefined;

  return () => {
    pending ??= factory();

    return pending;
  };
};
