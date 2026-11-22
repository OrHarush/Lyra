import YahooFinance from 'yahoo-finance2';
import { describe, expect, it } from 'vitest';

import { normalizeCurrency, normalizePrice } from '../../src/services/investments/marketData/currencyNormalization';
import { YahooMarketDataProvider } from '../../src/services/investments/marketData/YahooMarketDataProvider';

const fakeYahoo = (overrides: Record<string, unknown>) =>
  overrides as unknown as InstanceType<typeof YahooFinance>;

const bar = (date: string, close: number) => ({ date: new Date(`${date}T08:00:00Z`), close });

describe('currency normalization', () => {
  it('turns agorot into shekels and leaves other currencies alone', () => {
    expect(normalizePrice(501600, 'ILA')).toBe(5016);
    expect(normalizeCurrency('ILA')).toBe('ILS');
    expect(normalizePrice(762.4, 'USD')).toBe(762.4);
    expect(normalizeCurrency('USD')).toBe('USD');
    expect(normalizePrice(3.355, 'ILS')).toBe(3.355);
  });
});

describe('YahooMarketDataProvider', () => {
  it('divides TASE quotes by 100 and reports ILS, but not dollar quotes', async () => {
    const provider = new YahooMarketDataProvider(
      fakeYahoo({
        quote: async () => [
          {
            symbol: 'KSM-F80.TA',
            regularMarketPrice: 26300,
            currency: 'ILA',
            regularMarketTime: new Date('2026-11-20T11:32:03Z'),
            longName: 'KSM S&P',
          },
          { symbol: 'VOO', regularMarketPrice: 610.5, currency: 'USD' },
          { symbol: 'USDILS=X', regularMarketPrice: 3.355, currency: 'ILS' },
        ],
      })
    );

    const quotes = await provider.getQuotes(['KSM-F80.TA', 'VOO', 'USDILS=X']);

    expect(quotes['KSM-F80.TA']).toMatchObject({ price: 263, currency: 'ILS' });
    expect(quotes.VOO).toMatchObject({ price: 610.5, currency: 'USD' });
    expect(quotes['USDILS=X']).toMatchObject({ price: 3.355, currency: 'ILS' });
  });

  it('divides every historical close by 100 when the chart is quoted in agorot', async () => {
    const provider = new YahooMarketDataProvider(
      fakeYahoo({
        chart: async () => ({
          meta: { currency: 'ILA', exchangeTimezoneName: 'Asia/Jerusalem' },
          quotes: [bar('2026-11-18', 25000), bar('2026-11-19', 25500)],
        }),
      })
    );

    const closes = await provider.getDailyCloses('KSM-F80.TA', '2026-11-01', '2026-11-20');

    expect(closes.map(close => close.close)).toEqual([250, 255]);
  });

  it('leaves dollar chart closes untouched', async () => {
    const provider = new YahooMarketDataProvider(
      fakeYahoo({
        chart: async () => ({
          meta: { currency: 'USD', exchangeTimezoneName: 'America/New_York' },
          quotes: [bar('2026-11-18', 600.25)],
        }),
      })
    );

    const closes = await provider.getDailyCloses('VOO', '2026-11-01', '2026-11-20');

    expect(closes).toEqual([{ date: '2026-11-18', close: 600.25 }]);
  });

  it('reports shekel currency in search results for TASE listings', async () => {
    const provider = new YahooMarketDataProvider(
      fakeYahoo({
        search: async () => ({
          quotes: [
            { symbol: 'IS-FF701.TA', quoteType: 'ETF', longname: 'iShares NASDAQ 100', exchDisp: 'Tel Aviv' },
            { symbol: 'AAPL.XX', quoteType: 'OPTION' },
          ],
        }),
        quote: async () => [{ symbol: 'IS-FF701.TA', regularMarketPrice: 501600, currency: 'ILA' }],
      })
    );

    const results = await provider.searchSymbols('ishares');

    expect(results).toEqual([
      { symbol: 'IS-FF701.TA', name: 'iShares NASDAQ 100', exchange: 'Tel Aviv', currency: 'ILS', type: 'ETF' },
    ]);
  });

  it('maps a Yahoo failure to a market data error', async () => {
    const provider = new YahooMarketDataProvider(
      fakeYahoo({
        quote: async () => {
          throw new Error('boom');
        },
      })
    );

    await expect(provider.getQuotes(['VOO'])).rejects.toMatchObject({ kind: 'upstream' });
  });
});
