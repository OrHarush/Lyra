export interface CatalogEntry {
  id: string;
  yahooSymbol: string;
  name: string;
  badge: string;
  issuer: string;
  index: 'S&P 500' | 'NASDAQ 100';
  hedged: boolean;
  quoteCurrency: 'ILA';
  currency: 'ILS';
}

const entry = (
  id: string,
  yahooSymbol: string,
  name: string,
  badge: string,
  issuer: string,
  index: CatalogEntry['index'],
  hedged: boolean
): CatalogEntry => ({
  id,
  yahooSymbol,
  name,
  badge,
  issuer,
  index,
  hedged,
  quoteCurrency: 'ILA',
  currency: 'ILS',
});

// Verified offline against Yahoo and funder.co.il. Grow it only through scripts/verify-catalog.ts, never at runtime.
export const INSTRUMENT_CATALOG: CatalogEntry[] = [
  entry('1159250', 'IS-FF702.TA', 'iShares S&P 500', 'iSh S&P', 'iShares', 'S&P 500', false),
  entry('1159243', 'IS-FF701.TA', 'iShares NASDAQ 100', 'iSh NDX', 'iShares', 'NASDAQ 100', false),
  entry('1146471', 'KSM-F80.TA', 'קסם S&P 500', 'KSM S&P', 'קסם', 'S&P 500', false),
  entry('1146612', 'KSM-F83.TA', 'קסם NASDAQ 100 מנוטרלת', 'KSM NDX', 'קסם', 'NASDAQ 100', true),
  entry('1144385', 'TCH-F76.TA', 'תכלית S&P 500', 'TCH S&P', 'תכלית', 'S&P 500', false),
  entry('1144401', 'TCH-F77.TA', 'תכלית NASDAQ 100', 'TCH NDX', 'תכלית', 'NASDAQ 100', false),
  entry('1149103', 'HRL-F49.TA', 'הראל NASDAQ 100 מנוטרלת', 'HRL NDX', 'הראל', 'NASDAQ 100', true),
  entry('1150333', 'MTF-F23.TA', 'MTF S&P 500', 'MTF S&P', 'MTF', 'S&P 500', false),
  entry('1181387', 'MTF-F95.TA', 'MTF NASDAQ 100', 'MTF NDX', 'MTF', 'NASDAQ 100', false),
  entry('1181445', 'MTF-F96.TA', 'MTF NASDAQ 100 מנוטרלת', 'MTF NDX', 'MTF', 'NASDAQ 100', true),
  entry('1148162', 'IBI-F65.TA', 'IBI S&P 500', 'IBI S&P', 'IBI', 'S&P 500', false),
  entry('1165810', 'MORE-S1.TA', 'מור S&P 500', 'MORE S&P', 'מור', 'S&P 500', false),
  entry('1165836', 'MORE-S3.TA', 'מור NASDAQ 100', 'MORE NDX', 'מור', 'NASDAQ 100', false),
];

const INDEX_ORDER: CatalogEntry['index'][] = ['S&P 500', 'NASDAQ 100'];

export const findCatalogEntryById = (entries: CatalogEntry[], id: string) =>
  entries.find(candidate => candidate.id === id);

export const findCatalogEntryBySymbol = (entries: CatalogEntry[], yahooSymbol: string) =>
  entries.find(candidate => candidate.yahooSymbol === yahooSymbol);

// An empty query returns the whole catalog, S&P first, so the picker is useful before the user types.
export const searchCatalog = (entries: CatalogEntry[], query: string) => {
  const needle = query.trim().toLowerCase();

  if (needle === '') {
    return [...entries].sort((a, b) => INDEX_ORDER.indexOf(a.index) - INDEX_ORDER.indexOf(b.index));
  }

  return entries.filter(
    candidate =>
      candidate.id.startsWith(needle) ||
      candidate.name.toLowerCase().includes(needle) ||
      candidate.badge.toLowerCase().includes(needle) ||
      candidate.index.toLowerCase().includes(needle)
  );
};
