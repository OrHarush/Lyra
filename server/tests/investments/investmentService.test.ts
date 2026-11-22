import { beforeEach, describe, expect, it } from 'vitest';

import { INSTRUMENT_CATALOG } from '../../src/config/instrumentCatalog';
import { InvestmentPurchase } from '../../src/models/InvestmentPurchase';
import {
  createInvestmentService,
  InvestmentServiceDeps,
} from '../../src/services/investments/investmentService';
import { MarketDataCache } from '../../src/services/investments/marketData/MarketDataCache';
import { MarketDataGateway } from '../../src/services/investments/marketData/MarketDataGateway';
import {
  DailyClose,
  MarketDataError,
  MarketDataProvider,
  Quote,
  SymbolSearchResult,
} from '../../src/services/investments/marketData/MarketDataProvider';

const USER = 'user-1';
const OTHER_USER = 'user-2';
const NOW = new Date('2026-11-20T12:00:00Z');
const KSM_SP = '1146471';
const KSM_SP_SYMBOL = 'KSM-F80.TA';
const FX = 'USDILS=X';

class FakeProvider implements MarketDataProvider {
  quotes: Record<string, Quote> = {};
  closes: Record<string, DailyClose[]> = {};
  searchResults: SymbolSearchResult[] = [];
  failing = false;
  failingSymbols = new Set<string>();
  closeCalls = 0;

  async searchSymbols() {
    if (this.failing) {
      throw new MarketDataError('upstream', 'down');
    }

    return this.searchResults;
  }

  async getQuotes(symbols: string[]) {
    if (this.failing) {
      throw new MarketDataError('upstream', 'down');
    }

    return Object.fromEntries(
      symbols.flatMap(symbol => (this.quotes[symbol] ? [[symbol, this.quotes[symbol]]] : []))
    );
  }

  async getDailyCloses(symbol: string, from: string, to: string) {
    this.closeCalls += 1;

    if (this.failing || this.failingSymbols.has(symbol)) {
      throw new MarketDataError('upstream', 'down');
    }

    return (this.closes[symbol] ?? []).filter(close => close.date >= from && close.date <= to);
  }
}

const createFakeRepository = () => {
  let rows: InvestmentPurchase[] = [];
  let nextId = 1;

  const repository: InvestmentServiceDeps['purchases'] = {
    insert: async data => {
      const row = { ...data, id: String(nextId++) };

      rows.push(row);

      return row;
    },
    findAllByUser: async userId =>
      rows.filter(row => row.userId === userId).sort((a, b) => b.date.localeCompare(a.date)),
    findOneByUser: async (userId, id) =>
      rows.find(row => row.id === id && row.userId === userId) ?? null,
    updateOneByUser: async (userId, id, changes) => {
      const index = rows.findIndex(row => row.id === id && row.userId === userId);

      if (index === -1) {
        return null;
      }

      rows[index] = { ...rows[index], ...changes };

      return rows[index];
    },
    deleteOneByUser: async (userId, id) => {
      const before = rows.length;

      rows = rows.filter(row => !(row.id === id && row.userId === userId));

      return rows.length < before;
    },
  };

  return { repository, rows: () => rows, push: (row: InvestmentPurchase) => rows.push(row) };
};

const ilsQuote = (price: number): Quote => ({
  price,
  currency: 'ILS',
  asOf: '2026-11-20T11:30:00.000Z',
});

const usdQuote = (price: number, name = 'Vanguard S&P 500 ETF'): Quote => ({
  price,
  currency: 'USD',
  asOf: '2026-11-20T19:00:00.000Z',
  name,
});

const closesOf = (entries: Array<[string, number]>): DailyClose[] =>
  entries.map(([date, close]) => ({ date, close }));

describe('InvestmentService', () => {
  let provider: FakeProvider;
  let clock: { ms: number };
  let repo: ReturnType<typeof createFakeRepository>;
  let service: ReturnType<typeof createInvestmentService>;

  const buildService = () =>
    createInvestmentService({
      purchases: repo.repository,
      market: new MarketDataGateway(provider, new MarketDataCache(500, () => clock.ms)),
      now: () => new Date(clock.ms),
    });

  beforeEach(() => {
    provider = new FakeProvider();
    clock = { ms: NOW.getTime() };
    repo = createFakeRepository();
    provider.quotes = {
      [KSM_SP_SYMBOL]: ilsQuote(110),
      'IS-FF701.TA': ilsQuote(5016),
      VOO: usdQuote(110),
      [FX]: { ...ilsQuote(3.5) },
    };
    provider.closes = {
      [KSM_SP_SYMBOL]: closesOf([
        ['2026-10-05', 100],
        ['2026-10-06', 101],
        ['2026-10-07', 102],
        ['2026-10-08', 103],
      ]),
      VOO: closesOf([
        ['2026-10-05', 100],
        ['2026-10-06', 101],
        ['2026-10-07', 102],
        ['2026-10-08', 103],
        ['2026-10-09', 104],
      ]),
      [FX]: closesOf([
        ['2026-10-05', 3.3],
        ['2026-10-06', 3.32],
        ['2026-10-07', 3.34],
        ['2026-10-08', 3.36],
        ['2026-10-09', 3.38],
      ]),
    };
    service = buildService();
  });

  const buyCatalog = (overrides: Partial<Parameters<typeof service.createPurchase>[1]> = {}) =>
    service.createPurchase(USER, {
      source: 'catalog',
      instrumentId: KSM_SP,
      date: '2026-10-05',
      amount: 1000,
      ...overrides,
    });

  const buyUsd = (overrides: Partial<Parameters<typeof service.createPurchase>[1]> = {}) =>
    service.createPurchase(USER, {
      source: 'yahoo',
      instrumentId: 'VOO',
      date: '2026-10-05',
      amount: 1000,
      ...overrides,
    });

  describe('searchInstruments', () => {
    it('lists the whole catalog, S&P first, for an empty query', async () => {
      const { israeli, foreign } = await service.searchInstruments('');

      expect(israeli).toHaveLength(INSTRUMENT_CATALOG.length);
      expect(israeli[0].index).toBe('S&P 500');
      expect(israeli[israeli.length - 1].index).toBe('NASDAQ 100');
      expect(foreign).toEqual([]);
    });

    it('matches the security number by prefix, case-insensitively by name, and in Hebrew', async () => {
      expect((await service.searchInstruments('11466')).israeli.map(e => e.id)).toEqual(['1146612']);
      expect((await service.searchInstruments('NASDAQ')).israeli.every(e => e.index === 'NASDAQ 100')).toBe(true);
      expect((await service.searchInstruments('קסם')).israeli.map(e => e.issuer)).toEqual(['קסם', 'קסם']);
    });

    it('keeps only USD Yahoo results and drops funds already in the catalog', async () => {
      provider.searchResults = [
        { symbol: 'VOO', name: 'Vanguard S&P 500', exchange: 'NYSEArca', currency: 'USD', type: 'ETF' },
        { symbol: KSM_SP_SYMBOL, name: 'KSM', exchange: 'TLV', currency: 'ILS', type: 'ETF' },
        { symbol: 'VWRL.L', name: 'Vanguard FTSE', exchange: 'LSE', currency: 'GBP', type: 'ETF' },
        { symbol: 'XYZ', name: 'Unknown currency', exchange: 'X', currency: null, type: 'EQUITY' },
      ];

      const { foreign } = await service.searchInstruments('voo');

      expect(foreign.map(result => result.symbol)).toEqual(['VOO']);
    });

    it('still returns catalog hits when Yahoo search is down', async () => {
      provider.failing = true;

      const result = await service.searchInstruments('S&P');

      expect(result.israeli.length).toBeGreaterThan(0);
      expect(result).toMatchObject({ foreign: [], foreignUnavailable: true });
    });

    it('does not call Yahoo for a single character', async () => {
      provider.searchResults = [
        { symbol: 'VOO', name: 'V', exchange: 'X', currency: 'USD', type: 'ETF' },
      ];

      expect((await service.searchInstruments('v')).foreign).toEqual([]);
    });
  });

  describe('createPurchase', () => {
    it('prices a catalog fund in shekels and derives units from the closing price', async () => {
      const purchase = await buyCatalog();

      expect(purchase).toMatchObject({
        source: 'catalog',
        instrumentId: KSM_SP,
        yahooSymbol: KSM_SP_SYMBOL,
        displayName: 'קסם S&P 500',
        badge: 'KSM S&P',
        currency: 'ILS',
        priceAtPurchase: 100,
        units: 10,
        unitsSource: 'derived',
        priceDate: '2026-10-05',
      });
    });

    it('prices a foreign fund in dollars with a bare-symbol badge', async () => {
      const purchase = await buyUsd({ amount: 500 });

      expect(purchase).toMatchObject({
        source: 'yahoo',
        yahooSymbol: 'VOO',
        badge: 'VOO',
        currency: 'USD',
        units: 5,
      });
    });

    it('keeps manual units and back-computes the price', async () => {
      const purchase = await buyCatalog({ units: 8 });

      expect(purchase).toMatchObject({ units: 8, priceAtPurchase: 125, unitsSource: 'manual' });
    });

    it('uses the previous trading day close for a weekend date', async () => {
      const purchase = await buyCatalog({ date: '2026-10-10' });

      expect(purchase).toMatchObject({ priceDate: '2026-10-08', priceAtPurchase: 103 });
    });

    it('rejects an id that is not in the catalog', async () => {
      await expect(buyCatalog({ instrumentId: '9999999' })).rejects.toThrow(
        'investments.errors.instrumentNotFound'
      );
    });

    it('rejects an unknown Yahoo symbol', async () => {
      await expect(buyUsd({ instrumentId: 'NOPE' })).rejects.toThrow(
        'investments.errors.symbolNotFound'
      );
    });

    it('rejects a foreign fund that is not quoted in USD', async () => {
      await expect(buyUsd({ instrumentId: KSM_SP_SYMBOL })).rejects.toThrow(
        'investments.errors.unsupportedCurrency'
      );
    });

    it('rejects a future date', async () => {
      await expect(buyCatalog({ date: '2026-12-01' })).rejects.toThrow('investments.errors.futureDate');
    });

    it('rejects a date before the fund had any price', async () => {
      await expect(buyCatalog({ date: '2026-09-01' })).rejects.toThrow(
        'investments.errors.noPriceForDate'
      );
    });

    it('reports a Yahoo outage as service unavailable', async () => {
      provider.failing = true;

      await expect(buyCatalog()).rejects.toMatchObject({ statusCode: 503 });
    });
  });

  describe('updatePurchase and deletePurchase', () => {
    it('does not hit the market when only the amount changes', async () => {
      const created = await buyCatalog();
      const callsBefore = provider.closeCalls;

      const updated = await service.updatePurchase(USER, created.id, { amount: 2000 });

      expect(provider.closeCalls).toBe(callsBefore);
      expect(updated).toMatchObject({ amount: 2000, units: 20, priceAtPurchase: 100 });
    });

    it('re-prices when the date changes', async () => {
      const created = await buyCatalog();

      const updated = await service.updatePurchase(USER, created.id, { date: '2026-10-07' });

      expect(updated).toMatchObject({ priceAtPurchase: 102, priceDate: '2026-10-07' });
    });

    it('re-resolves when the instrument changes', async () => {
      const created = await buyCatalog();

      const updated = await service.updatePurchase(USER, created.id, {
        source: 'yahoo',
        instrumentId: 'VOO',
      });

      expect(updated).toMatchObject({ source: 'yahoo', yahooSymbol: 'VOO', currency: 'USD', badge: 'VOO' });
    });

    it('keeps manual units when the amount changes and drops them when cleared', async () => {
      const created = await buyCatalog({ units: 8 });

      const kept = await service.updatePurchase(USER, created.id, { amount: 1200 });
      const cleared = await service.updatePurchase(USER, created.id, { units: null });

      expect(kept).toMatchObject({ units: 8, priceAtPurchase: 150, unitsSource: 'manual' });
      expect(cleared).toMatchObject({ units: 12, unitsSource: 'derived' });
    });

    it("cannot update or delete another user's purchase", async () => {
      const created = await buyCatalog();

      await expect(service.updatePurchase(OTHER_USER, created.id, { amount: 1 })).rejects.toMatchObject({
        statusCode: 404,
      });
      await expect(service.deletePurchase(OTHER_USER, created.id)).rejects.toMatchObject({
        statusCode: 404,
      });
      expect(await service.listPurchases(OTHER_USER)).toEqual([]);
    });

    it('deletes an owned purchase', async () => {
      const created = await buyCatalog();

      await service.deletePurchase(USER, created.id);

      expect(await service.listPurchases(USER)).toEqual([]);
    });
  });

  describe('getSummary', () => {
    it('summarises an Israeli-only portfolio in shekels', async () => {
      await buyCatalog();
      await buyCatalog({ date: '2026-10-06', amount: 505 });

      const summary = await service.getSummary(USER);

      expect(summary.funds[0]).toMatchObject({ invested: 1505, units: 15, value: 1650, pl: 145 });
      expect(summary.totals).toMatchObject({ invested: 1505, value: 1650, pl: 145 });
      expect(summary.usdIls).toBeNull();
    });

    it("includes the currency effect: USD funds are costed at the purchase date's rate", async () => {
      await buyCatalog();
      await buyUsd();

      const summary = await service.getSummary(USER);
      const usd = summary.funds.find(fund => fund.yahooSymbol === 'VOO');

      expect(usd).toMatchObject({ invested: 1000, value: 1100, pl: 100 });
      expect(usd?.investedIls).toBeCloseTo(1000 * 3.3);
      expect(usd?.valueIls).toBeCloseTo(1100 * 3.5);
      expect(usd?.plIls).toBeCloseTo(1100 * 3.5 - 1000 * 3.3);
      expect(summary.totals.invested).toBeCloseTo(1000 + 3300);
      expect(summary.totals.value).toBeCloseTo(1100 + 3850);
      expect(summary.totals.pl).toBeCloseTo(650);
      expect(summary.usdIls).toBe(3.5);
    });

    it('allocates by shekel value so shares add up to 100%', async () => {
      await buyCatalog();
      await buyUsd();

      const summary = await service.getSummary(USER);
      const total = summary.funds.reduce((sum, fund) => sum + (fund.allocationPct ?? 0), 0);

      expect(total).toBeCloseTo(1);
    });

    it('values each purchase in its own currency and in shekels', async () => {
      await buyUsd();

      const [purchase] = (await service.getSummary(USER)).purchases;

      expect(purchase).toMatchObject({ currency: 'USD', amount: 1000, valueToday: 1100, pl: 100 });
      expect(purchase.amountIls).toBeCloseTo(3300);
      expect(purchase.valueTodayIls).toBeCloseTo(3850);
      expect(purchase.plIls).toBeCloseTo(550);
    });

    it("falls back to today's rate and flags it when the FX history is unavailable", async () => {
      await buyUsd();
      delete provider.closes[FX];

      const summary = await service.getSummary(USER);

      expect(summary.funds[0].investedIls).toBeCloseTo(1000 * 3.5);
      expect(summary.fxApproximate).toBe(true);
    });

    it('renders catalog funds from the catalog, not the stored snapshot', async () => {
      repo.push({
        id: 'old',
        userId: USER,
        source: 'catalog',
        instrumentId: KSM_SP,
        yahooSymbol: KSM_SP_SYMBOL,
        displayName: 'old name',
        badge: 'old',
        currency: 'ILS',
        date: '2026-10-05',
        priceDate: '2026-10-05',
        amount: 1000,
        priceAtPurchase: 100,
        units: 10,
        unitsSource: 'derived',
      });

      const summary = await service.getSummary(USER);

      expect(summary.funds[0]).toMatchObject({ displayName: 'קסם S&P 500', badge: 'KSM S&P', hedged: false });
      expect(summary.purchases[0]).toMatchObject({ displayName: 'קסם S&P 500', badge: 'KSM S&P' });
    });

    it('serves the last cached quotes and flags them stale when Yahoo fails', async () => {
      await buyCatalog();
      await service.getSummary(USER);
      clock.ms += 16 * 60 * 1000;
      provider.failing = true;

      const summary = await service.getSummary(USER);

      expect(summary.stale).toBe(true);
      expect(summary.totals.value).toBe(1100);
    });

    it('returns purchases without values when Yahoo is down and nothing is cached', async () => {
      await buyCatalog();
      const cold = buildService();

      provider.failing = true;

      const summary = await cold.getSummary(USER);

      expect(summary.purchases[0].valueToday).toBeNull();
      expect(summary.totals.value).toBeNull();
      expect(summary.hasMissingPrices).toBe(true);
    });

    it('keeps priced funds when Yahoo returns only some symbols', async () => {
      provider.closes['IS-FF701.TA'] = closesOf([['2026-10-05', 5000]]);
      await buyCatalog();
      await buyCatalog({ instrumentId: '1159243', amount: 5000 });
      delete provider.quotes['IS-FF701.TA'];

      const summary = await service.getSummary(USER);

      expect(summary.hasMissingPrices).toBe(true);
      expect(summary.funds.find(fund => fund.yahooSymbol === 'IS-FF701.TA')?.value).toBeNull();
      expect(summary.totals).toMatchObject({ invested: 6000, value: 1100, pl: 100 });
    });

    it('returns an empty summary for a user with no purchases', async () => {
      const summary = await service.getSummary(OTHER_USER);

      expect(summary.funds).toEqual([]);
      expect(summary.totals).toMatchObject({ invested: 0, value: null });
    });
  });

  describe('getHistory', () => {
    it('carries each market forward over its own holidays', async () => {
      await buyCatalog();
      await buyUsd({ amount: 1010 });

      const { series } = await service.getHistory(USER, { range: 'ALL' });
      const friday = series.find(point => point.date === '2026-10-09');

      expect(friday?.value).toBeCloseTo(10 * 103 + 10.1 * 104 * 3.38, 5);
    });

    it('converts dollar funds with the rate on each day and costs them at the purchase date', async () => {
      await buyUsd({ date: '2026-10-06', amount: 1010 });

      const { series } = await service.getHistory(USER, { range: 'ALL' });
      const wednesday = series.find(point => point.date === '2026-10-07');

      expect(wednesday?.invested).toBeCloseTo(1010 * 3.32);
      expect(wednesday?.value).toBeCloseTo(10 * 102 * 3.34);
    });

    it('counts a purchase from its own date onward and returns shekel markers', async () => {
      await buyCatalog({ date: '2026-10-05' });
      await buyCatalog({ date: '2026-10-07', amount: 510 });

      const { series, purchases } = await service.getHistory(USER, { range: 'ALL' });

      expect(series.map(point => point.invested)).toEqual([1000, 1000, 1510, 1510]);
      expect(purchases.map(marker => marker.amountIls).sort((a, b) => a - b)).toEqual([510, 1000]);
    });

    it('filters by Yahoo symbol', async () => {
      await buyCatalog();
      await buyUsd();

      const { series, purchases } = await service.getHistory(USER, {
        range: 'ALL',
        symbols: [KSM_SP_SYMBOL],
      });

      expect(purchases.map(marker => marker.yahooSymbol)).toEqual([KSM_SP_SYMBOL]);
      expect(series[0]).toEqual({ date: '2026-10-05', invested: 1000, value: 1000 });
    });

    it('starts at the later of the first purchase and the range start', async () => {
      await buyCatalog({ date: '2026-10-05' });
      clock.ms = new Date('2027-03-01T12:00:00Z').getTime();
      provider.closes[KSM_SP_SYMBOL] = [
        ...provider.closes[KSM_SP_SYMBOL],
        ...closesOf([['2027-02-27', 130]]),
      ];

      const { series, purchases } = await service.getHistory(USER, { range: '3M' });

      expect(series).toEqual([{ date: '2027-02-27', invested: 1000, value: 1300 }]);
      expect(purchases).toEqual([]);
    });

    it('downsamples to weekly points beyond 400 points', async () => {
      const days: Array<[string, number]> = [];
      const start = Date.UTC(2025, 0, 1);

      for (let offset = 0; offset < 500; offset += 1) {
        days.push([new Date(start + offset * 86_400_000).toISOString().slice(0, 10), 100 + offset]);
      }

      provider.closes[KSM_SP_SYMBOL] = closesOf(days);
      await buyCatalog({ date: '2025-01-02' });

      const { series } = await service.getHistory(USER, { range: 'ALL' });

      expect(series.length).toBeLessThan(100);
      expect(series.length).toBeGreaterThan(60);
    });

    it('reports a symbol as missing when Yahoo fails and nothing is cached', async () => {
      await buyCatalog();
      const cold = buildService();

      provider.failing = true;

      const result = await cold.getHistory(USER, { range: 'ALL' });

      expect(result.missingSymbols).toEqual([KSM_SP_SYMBOL]);
      expect(result.series).toEqual([]);
    });

    it('drops dollar funds, and reports them, when the FX history cannot be loaded', async () => {
      await buyCatalog();
      await buyUsd();
      provider.failingSymbols.add(FX);

      const result = await service.getHistory(USER, { range: 'ALL' });

      expect(result.missingSymbols).toEqual(['VOO']);
      expect(result.series[0]).toEqual({ date: '2026-10-05', invested: 1000, value: 1000 });
    });
  });
});
