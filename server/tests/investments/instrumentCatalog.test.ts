import { describe, expect, it } from 'vitest';

import {
  CatalogEntry,
  INSTRUMENT_CATALOG,
  searchCatalog,
} from '../../src/config/instrumentCatalog';
import {
  DailyClose,
  MarketDataProvider,
  Quote,
} from '../../src/services/investments/marketData/MarketDataProvider';
import { verifyCatalog } from '../../src/services/investments/verifyCatalog';

const TODAY = '2026-11-20';

const fakeProvider = (
  quotes: Record<string, Quote>,
  closesFor: (symbol: string) => DailyClose[]
): MarketDataProvider => ({
  searchSymbols: async () => [],
  getQuotes: async symbols =>
    Object.fromEntries(symbols.flatMap(symbol => (quotes[symbol] ? [[symbol, quotes[symbol]]] : []))),
  getDailyCloses: async symbol => closesFor(symbol),
});

const yearOfCloses = (): DailyClose[] =>
  Array.from({ length: 240 }, (_, index) => ({ date: `2026-01-${String((index % 28) + 1).padStart(2, '0')}`, close: 100 + index }));

const shekelQuote: Quote = { price: 100, currency: 'ILS', asOf: '2026-11-20T11:00:00Z' };

describe('instrument catalog', () => {
  it('has 13 entries with unique ids and Yahoo symbols in TASE format', () => {
    expect(INSTRUMENT_CATALOG).toHaveLength(13);
    expect(new Set(INSTRUMENT_CATALOG.map(entry => entry.id)).size).toBe(13);
    expect(new Set(INSTRUMENT_CATALOG.map(entry => entry.yahooSymbol)).size).toBe(13);
    expect(INSTRUMENT_CATALOG.every(entry => /^[A-Z]+-[A-Z0-9]+\.TA$/.test(entry.yahooSymbol))).toBe(true);
    expect(INSTRUMENT_CATALOG.every(entry => entry.quoteCurrency === 'ILA' && entry.currency === 'ILS')).toBe(true);
  });

  it('marks exactly the three currency-hedged funds', () => {
    expect(INSTRUMENT_CATALOG.filter(entry => entry.hedged).map(entry => entry.id).sort()).toEqual([
      '1146612',
      '1149103',
      '1181445',
    ]);
  });

  it('finds funds by id prefix, name, badge and index', () => {
    expect(searchCatalog(INSTRUMENT_CATALOG, '1159').map(e => e.id).sort()).toEqual(['1159243', '1159250']);
    expect(searchCatalog(INSTRUMENT_CATALOG, 'ishares')).toHaveLength(2);
    expect(searchCatalog(INSTRUMENT_CATALOG, 'ksm ndx').map(e => e.id)).toEqual(['1146612']);
    expect(searchCatalog(INSTRUMENT_CATALOG, 'nasdaq')).toHaveLength(7);
  });
});

describe('verifyCatalog', () => {
  const quotesForAll = Object.fromEntries(INSTRUMENT_CATALOG.map(entry => [entry.yahooSymbol, shekelQuote]));

  it('passes when every symbol has a shekel quote and a year of closes', async () => {
    const results = await verifyCatalog(fakeProvider(quotesForAll, yearOfCloses), INSTRUMENT_CATALOG, TODAY);

    expect(results.every(result => result.ok)).toBe(true);
  });

  it('fails a fake bad symbol and nothing else', async () => {
    const bad: CatalogEntry = { ...INSTRUMENT_CATALOG[0], id: '0000000', yahooSymbol: 'FAKE-ZZ99.TA' };

    const results = await verifyCatalog(
      fakeProvider(quotesForAll, yearOfCloses),
      [...INSTRUMENT_CATALOG, bad],
      TODAY
    );

    expect(results.filter(result => !result.ok).map(result => result.yahooSymbol)).toEqual(['FAKE-ZZ99.TA']);
    expect(results.find(result => !result.ok)?.reason).toBe('no quote returned');
  });

  it('fails a symbol still quoted in agorot, or with too little history', async () => {
    const agorot = { ...quotesForAll, [INSTRUMENT_CATALOG[0].yahooSymbol]: { ...shekelQuote, currency: 'ILA' } };

    const quoteIssue = await verifyCatalog(fakeProvider(agorot, yearOfCloses), INSTRUMENT_CATALOG, TODAY);
    const historyIssue = await verifyCatalog(
      fakeProvider(quotesForAll, symbol => (symbol === INSTRUMENT_CATALOG[1].yahooSymbol ? [] : yearOfCloses())),
      INSTRUMENT_CATALOG,
      TODAY
    );

    expect(quoteIssue.filter(result => !result.ok)).toHaveLength(1);
    expect(historyIssue.filter(result => !result.ok).map(result => result.id)).toEqual([INSTRUMENT_CATALOG[1].id]);
  });

  it('reports a provider error as a failure instead of throwing', async () => {
    const throwing: MarketDataProvider = {
      searchSymbols: async () => [],
      getQuotes: async () => {
        throw new Error('network down');
      },
      getDailyCloses: async () => [],
    };

    const results = await verifyCatalog(throwing, [INSTRUMENT_CATALOG[0]], TODAY);

    expect(results[0]).toMatchObject({ ok: false, reason: 'network down' });
  });
});
