import { CatalogEntry } from '../../config/instrumentCatalog';
import { addDaysIso } from './isoDate';
import { MarketDataProvider } from './marketData/MarketDataProvider';

const HISTORY_DAYS = 365;
const MIN_HISTORY_POINTS = 100;

export interface CatalogVerification {
  id: string;
  yahooSymbol: string;
  ok: boolean;
  reason?: string;
  price?: number;
  historyPoints?: number;
}

const verifyEntry = async (
  provider: MarketDataProvider,
  entry: CatalogEntry,
  today: string
): Promise<CatalogVerification> => {
  const base = { id: entry.id, yahooSymbol: entry.yahooSymbol };

  try {
    const quotes = await provider.getQuotes([entry.yahooSymbol]);
    const quote = quotes[entry.yahooSymbol];

    if (!quote) {
      return { ...base, ok: false, reason: 'no quote returned' };
    }

    if (quote.currency !== entry.currency) {
      return { ...base, ok: false, reason: `quote currency ${quote.currency}, expected ${entry.currency}` };
    }

    const closes = await provider.getDailyCloses(
      entry.yahooSymbol,
      addDaysIso(today, -HISTORY_DAYS),
      today
    );

    if (closes.length < MIN_HISTORY_POINTS) {
      return { ...base, ok: false, reason: `only ${closes.length} daily closes in a year` };
    }

    return { ...base, ok: true, price: quote.price, historyPoints: closes.length };
  } catch (error) {
    return { ...base, ok: false, reason: error instanceof Error ? error.message : 'unknown error' };
  }
};

export const verifyCatalog = (
  provider: MarketDataProvider,
  entries: CatalogEntry[],
  today: string
) => Promise.all(entries.map(entry => verifyEntry(provider, entry, today)));
