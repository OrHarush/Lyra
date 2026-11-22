import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InvestmentPurchase } from '../../src/models/InvestmentPurchase';
import { signTestToken } from '../helpers/tokens';

const store = vi.hoisted(() => ({ rows: [] as InvestmentPurchase[], nextId: 1 }));

vi.mock('../../src/repositories/investmentPurchaseRepository', () => ({
  insert: async (data: Omit<InvestmentPurchase, 'id'>) => {
    const row = { ...data, id: String(store.nextId++).padStart(24, '0') };

    store.rows.push(row);

    return row;
  },
  findAllByUser: async (userId: string) => store.rows.filter(row => row.userId === userId),
  findOneByUser: async (userId: string, id: string) =>
    store.rows.find(row => row.id === id && row.userId === userId) ?? null,
  updateOneByUser: async (userId: string, id: string, changes: Partial<InvestmentPurchase>) => {
    const index = store.rows.findIndex(row => row.id === id && row.userId === userId);

    if (index === -1) {
      return null;
    }

    store.rows[index] = { ...store.rows[index], ...changes };

    return store.rows[index];
  },
  deleteOneByUser: async (userId: string, id: string) => {
    const before = store.rows.length;

    store.rows = store.rows.filter(row => !(row.id === id && row.userId === userId));

    return store.rows.length < before;
  },
  deleteAllByUser: async () => undefined,
}));

vi.mock('../../src/services/investments/marketData/YahooMarketDataProvider', () => ({
  YahooMarketDataProvider: class {
    async searchSymbols() {
      return [];
    }

    async getQuotes(symbols: string[]) {
      const known: Record<string, { price: number; currency: string; name?: string }> = {
        VOO: { price: 110, currency: 'USD', name: 'Vanguard S&P 500' },
        'KSM-F80.TA': { price: 110, currency: 'ILS' },
        'USDILS=X': { price: 3.5, currency: 'ILS' },
      };

      return Object.fromEntries(
        symbols
          .filter(symbol => known[symbol])
          .map(symbol => [symbol, { ...known[symbol], asOf: '2026-11-20T15:00:00.000Z' }])
      );
    }

    async getDailyCloses() {
      return [{ date: '2020-01-06', close: 100 }];
    }
  },
}));

vi.mock('../../src/services/analyticsService', () => ({ track: async () => undefined }));

const { default: app } = await import('../../src/app');

const asUser = (userId: string) => `Bearer ${signTestToken({ userId })}`;
const alice = asUser('alice');
const bob = asUser('bob');

const validPurchase = {
  source: 'catalog',
  instrumentId: '1146471',
  date: '2020-01-06',
  amount: 1000,
};

const createAs = (auth: string, body: object = validPurchase) =>
  request(app).post('/api/investments/purchases').set('Authorization', auth).send(body);

describe('investments API', () => {
  beforeEach(() => {
    store.rows = [];
  });

  describe('access', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/investments/summary');

      expect(res.status).toBe(401);
    });
  });

  describe('validation', () => {
    it.each([
      ['an empty instrument id', { ...validPurchase, instrumentId: '' }],
      ['an unknown source', { ...validPurchase, source: 'tase' }],
      ['a zero amount', { ...validPurchase, amount: 0 }],
      ['a negative amount', { ...validPurchase, amount: -5 }],
      ['non-positive units', { ...validPurchase, units: 0 }],
      ['a malformed date', { ...validPurchase, date: '06/01/2020' }],
      ['an overlong note', { ...validPurchase, note: 'x'.repeat(201) }],
    ])('rejects %s', async (_label, body) => {
      const res = await createAs(alice, body);

      expect(res.status).toBe(400);
    });

    it('rejects a future date', async () => {
      const res = await createAs(alice, { ...validPurchase, date: '2099-01-01' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('investments.errors.futureDate');
    });

    it('rejects an unknown Yahoo symbol with a field-mappable error', async () => {
      const res = await createAs(alice, { ...validPurchase, source: 'yahoo', instrumentId: 'NOPE' });

      expect(res.body.error).toBe('investments.errors.symbolNotFound');
    });

    it('rejects a catalog id that does not exist', async () => {
      const res = await createAs(alice, { ...validPurchase, instrumentId: '9999999' });

      expect(res.body.error).toBe('investments.errors.instrumentNotFound');
    });

    it('rejects changing only half of the instrument on update', async () => {
      const id = (await createAs(alice)).body.data.id as string;

      const res = await request(app)
        .patch(`/api/investments/purchases/${id}`)
        .set('Authorization', alice)
        .send({ source: 'yahoo' });

      expect(res.status).toBe(400);
    });

    it('rejects an unknown history range', async () => {
      const res = await request(app)
        .get('/api/investments/history?range=5Y')
        .set('Authorization', alice);

      expect(res.status).toBe(400);
    });

    it('rejects a malformed purchase id', async () => {
      const res = await request(app)
        .delete('/api/investments/purchases/not-an-id')
        .set('Authorization', alice);

      expect(res.status).toBe(400);
    });
  });

  describe('instrument search', () => {
    it('returns the whole catalog for an empty query', async () => {
      const res = await request(app)
        .get('/api/investments/instruments/search')
        .set('Authorization', alice);

      expect(res.status).toBe(200);
      expect(res.body.data.israeli).toHaveLength(13);
    });
  });

  describe('purchases', () => {
    it('creates a purchase with server-computed units', async () => {
      const res = await createAs(alice);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        yahooSymbol: 'KSM-F80.TA',
        currency: 'ILS',
        units: 10,
        priceAtPurchase: 100,
      });
    });

    it('never exposes or lets another user touch a purchase they do not own', async () => {
      const id = (await createAs(alice)).body.data.id as string;

      const list = await request(app).get('/api/investments/purchases').set('Authorization', bob);
      const patch = await request(app)
        .patch(`/api/investments/purchases/${id}`)
        .set('Authorization', bob)
        .send({ amount: 1 });
      const remove = await request(app)
        .delete(`/api/investments/purchases/${id}`)
        .set('Authorization', bob);

      expect(list.body.data).toEqual([]);
      expect(patch.status).toBe(404);
      expect(remove.status).toBe(404);
      expect(store.rows).toHaveLength(1);
    });

    it('lets the owner update and delete', async () => {
      const id = (await createAs(alice)).body.data.id as string;

      const patch = await request(app)
        .patch(`/api/investments/purchases/${id}`)
        .set('Authorization', alice)
        .send({ amount: 2000 });
      const remove = await request(app)
        .delete(`/api/investments/purchases/${id}`)
        .set('Authorization', alice);

      expect(patch.body.data).toMatchObject({ amount: 2000, units: 20 });
      expect(remove.status).toBe(200);
      expect(store.rows).toHaveLength(0);
    });

    it("summarises only the caller's own purchases", async () => {
      await createAs(alice);

      const mine = await request(app).get('/api/investments/summary').set('Authorization', alice);
      const theirs = await request(app).get('/api/investments/summary').set('Authorization', bob);

      expect(mine.body.data.totals.invested).toBe(1000);
      expect(theirs.body.data.totals.invested).toBe(0);
    });
  });
});
