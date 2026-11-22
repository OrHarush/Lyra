export interface FundColor {
  main: string;
  tint: string;
}

const FUND_PALETTE: FundColor[] = [
  { main: '#a78bfa', tint: '#c4b5fd' },
  { main: '#60a5fa', tint: '#93c5fd' },
  { main: '#34d399', tint: '#6ee7b7' },
  { main: '#fbbf24', tint: '#fcd34d' },
  { main: '#f472b6', tint: '#f9a8d4' },
  { main: '#22d3ee', tint: '#67e8f9' },
];

export const OTHER_FUND_COLOR: FundColor = { main: '#94a3b8', tint: '#cbd5e1' };

export const MAX_COLORED_FUNDS = FUND_PALETTE.length;

interface PurchaseDate {
  yahooSymbol: string;
  date: string;
}

// Ordering by first purchase keeps a fund's color stable when later funds are added.
export const buildFundColorMap = (purchases: PurchaseDate[]) => {
  const firstPurchaseBySymbol = new Map<string, string>();

  for (const { yahooSymbol: symbol, date } of purchases) {
    const known = firstPurchaseBySymbol.get(symbol);

    if (known === undefined || date < known) {
      firstPurchaseBySymbol.set(symbol, date);
    }
  }

  const ordered = [...firstPurchaseBySymbol].sort(
    ([symbolA, dateA], [symbolB, dateB]) => dateA.localeCompare(dateB) || symbolA.localeCompare(symbolB)
  );

  return new Map(
    ordered.map(([symbol], index) => [symbol, FUND_PALETTE[index] ?? OTHER_FUND_COLOR] as const)
  );
};
