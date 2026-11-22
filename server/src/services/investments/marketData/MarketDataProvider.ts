export interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  currency: string | null;
  type: 'ETF' | 'EQUITY';
}

export interface Quote {
  price: number;
  currency: string;
  asOf: string;
  name?: string;
}

export interface DailyClose {
  date: string;
  close: number;
}

export interface MarketDataProvider {
  searchSymbols(query: string): Promise<SymbolSearchResult[]>;
  getQuotes(symbols: string[]): Promise<Record<string, Quote>>;
  getDailyCloses(symbol: string, from: string, to: string): Promise<DailyClose[]>;
}

export type MarketDataErrorKind = 'timeout' | 'upstream' | 'notFound';

export class MarketDataError extends Error {
  kind: MarketDataErrorKind;

  constructor(kind: MarketDataErrorKind, message: string) {
    super(message);
    this.kind = kind;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
