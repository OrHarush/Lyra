import { InstrumentSource, InvestmentPurchase, PurchaseCurrency } from '../../models/InvestmentPurchase';
import { mondayOfWeekIso } from './isoDate';
import { DailyClose } from './marketData/MarketDataProvider';

export const MAX_HISTORY_POINTS = 400;

export interface PriceQuote {
  price: number;
  asOf: string;
  stale: boolean;
}

export interface FxRates {
  today: number | null;
  onDate: (date: string) => number | null;
  isStale: boolean;
}

export interface PurchaseView {
  id: string;
  yahooSymbol: string;
  badge: string;
  displayName: string;
  currency: PurchaseCurrency;
  date: string;
  priceDate: string;
  amount: number;
  amountIls: number | null;
  units: number;
  valueToday: number | null;
  pl: number | null;
  plPct: number | null;
  valueTodayIls: number | null;
  plIls: number | null;
  plPctIls: number | null;
}

export interface FundView {
  yahooSymbol: string;
  source: InstrumentSource;
  instrumentId: string;
  displayName: string;
  badge: string;
  hedged: boolean;
  currency: PurchaseCurrency;
  invested: number;
  units: number;
  currentPrice: number | null;
  value: number | null;
  pl: number | null;
  plPct: number | null;
  investedIls: number | null;
  valueIls: number | null;
  plIls: number | null;
  plPctIls: number | null;
  allocationPct: number | null;
}

// Every portfolio-level figure is in shekels, so a USD fund's currency effect is part of its profit.
export interface PortfolioTotals {
  invested: number;
  value: number | null;
  pl: number | null;
  plPct: number | null;
}

export interface PortfolioSummary {
  totals: PortfolioTotals;
  funds: FundView[];
  purchases: PurchaseView[];
  usdIls: number | null;
  pricesAsOf: string | null;
  stale: boolean;
  hasMissingPrices: boolean;
  fxApproximate: boolean;
}

export interface HistoryPoint {
  date: string;
  invested: number;
  value: number;
}

export interface PurchaseMarker {
  id: string;
  date: string;
  yahooSymbol: string;
  amountIls: number;
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const ratio = (part: number, whole: number) => (whole > 0 ? part / whole : 0);

const allKnown = (values: Array<number | null>): values is number[] =>
  values.every(value => value !== null);

export const resolveCloseOnOrBefore = (closes: DailyClose[], date: string) => {
  const onOrBefore = closes.filter(close => close.date <= date);

  return onOrBefore.length > 0 ? onOrBefore[onOrBefore.length - 1] : null;
};

export const computePosition = (amount: number, closePrice: number, manualUnits?: number) => {
  if (manualUnits !== undefined) {
    return {
      units: manualUnits,
      priceAtPurchase: amount / manualUnits,
      unitsSource: 'manual' as const,
    };
  }

  return {
    units: amount / closePrice,
    priceAtPurchase: closePrice,
    unitsSource: 'derived' as const,
  };
};

export const buildFxRates = (
  todayRate: number | null,
  closes: DailyClose[] | null,
  isStale: boolean
): FxRates => ({
  today: todayRate,
  onDate: date => (closes ? (resolveCloseOnOrBefore(closes, date)?.close ?? null) : null),
  isStale,
});

const rateAtPurchase = (purchase: InvestmentPurchase, fx: FxRates) => {
  if (purchase.currency === 'ILS') {
    return { rate: 1, isApproximate: false };
  }

  const exact = fx.onDate(purchase.date);

  if (exact !== null) {
    return { rate: exact, isApproximate: false };
  }

  return { rate: fx.today, isApproximate: fx.today !== null };
};

const toTodayIls = (value: number | null, currency: PurchaseCurrency, fx: FxRates) => {
  if (value === null) {
    return null;
  }

  if (currency === 'ILS') {
    return value;
  }

  return fx.today === null ? null : value * fx.today;
};

const groupBySymbol = (purchases: InvestmentPurchase[]) => {
  const groups = new Map<string, InvestmentPurchase[]>();

  for (const purchase of purchases) {
    groups.set(purchase.yahooSymbol, [...(groups.get(purchase.yahooSymbol) ?? []), purchase]);
  }

  return groups;
};

const buildFundView = (
  yahooSymbol: string,
  rows: InvestmentPurchase[],
  fx: FxRates,
  quote?: PriceQuote
): FundView => {
  const first = rows[0];
  const invested = sum(rows.map(row => row.amount));
  const units = sum(rows.map(row => row.units));
  const value = quote ? units * quote.price : null;
  const pl = value === null ? null : value - invested;
  const amountsIls = rows.map(row => {
    const { rate } = rateAtPurchase(row, fx);

    return rate === null ? null : row.amount * rate;
  });
  const investedIls = allKnown(amountsIls) ? sum(amountsIls) : null;
  const valueIls = toTodayIls(value, first.currency, fx);
  const plIls = valueIls === null || investedIls === null ? null : valueIls - investedIls;

  return {
    yahooSymbol,
    source: first.source,
    instrumentId: first.instrumentId,
    displayName: first.displayName,
    badge: first.badge,
    hedged: false,
    currency: first.currency,
    invested,
    units,
    currentPrice: quote?.price ?? null,
    value,
    pl,
    plPct: pl === null ? null : ratio(pl, invested),
    investedIls,
    valueIls,
    plIls,
    plPctIls: plIls === null || investedIls === null ? null : ratio(plIls, investedIls),
    allocationPct: null,
  };
};

const withAllocation = (funds: FundView[]): FundView[] => {
  const totalValue = sum(funds.map(fund => fund.valueIls ?? 0));

  return funds.map(fund => ({
    ...fund,
    allocationPct: fund.valueIls === null ? null : ratio(fund.valueIls, totalValue),
  }));
};

const buildPurchaseView = (
  purchase: InvestmentPurchase,
  fx: FxRates,
  quote?: PriceQuote
): PurchaseView => {
  const { rate } = rateAtPurchase(purchase, fx);
  const amountIls = rate === null ? null : purchase.amount * rate;
  const valueToday = quote ? purchase.units * quote.price : null;
  const pl = valueToday === null ? null : valueToday - purchase.amount;
  const valueTodayIls = toTodayIls(valueToday, purchase.currency, fx);
  const plIls = valueTodayIls === null || amountIls === null ? null : valueTodayIls - amountIls;

  return {
    id: purchase.id,
    yahooSymbol: purchase.yahooSymbol,
    badge: purchase.badge,
    displayName: purchase.displayName,
    currency: purchase.currency,
    date: purchase.date,
    priceDate: purchase.priceDate,
    amount: purchase.amount,
    amountIls,
    units: purchase.units,
    valueToday,
    pl,
    plPct: pl === null ? null : ratio(pl, purchase.amount),
    valueTodayIls,
    plIls,
    plPctIls: plIls === null || amountIls === null ? null : ratio(plIls, amountIls),
  };
};

// Totals profit uses only funds we could price in shekels, so one missing quote cannot masquerade as a total loss.
const buildTotals = (funds: FundView[]): PortfolioTotals => {
  const priced = funds.filter(fund => fund.valueIls !== null && fund.investedIls !== null);
  const value = priced.length > 0 ? sum(priced.map(fund => fund.valueIls as number)) : null;
  const pricedInvested = sum(priced.map(fund => fund.investedIls as number));
  const pl = value === null ? null : value - pricedInvested;

  return {
    invested: sum(funds.map(fund => fund.investedIls ?? 0)),
    value,
    pl,
    plPct: pl === null ? null : ratio(pl, pricedInvested),
  };
};

const oldestAsOf = (quotes: PriceQuote[]) =>
  quotes.length > 0 ? quotes.map(quote => quote.asOf).sort()[0] : null;

export const buildSummary = (
  purchases: InvestmentPurchase[],
  quotes: Record<string, PriceQuote>,
  fx: FxRates
): PortfolioSummary => {
  const groups = groupBySymbol(purchases);
  const funds = withAllocation(
    [...groups].map(([symbol, rows]) => buildFundView(symbol, rows, fx, quotes[symbol]))
  );
  const heldQuotes = [...groups.keys()].flatMap(symbol => (quotes[symbol] ? [quotes[symbol]] : []));
  const holdsUsd = purchases.some(purchase => purchase.currency === 'USD');

  return {
    totals: buildTotals(funds),
    funds,
    purchases: purchases.map(purchase => buildPurchaseView(purchase, fx, quotes[purchase.yahooSymbol])),
    usdIls: holdsUsd ? fx.today : null,
    pricesAsOf: oldestAsOf(heldQuotes),
    stale: heldQuotes.some(quote => quote.stale) || (holdsUsd && fx.isStale),
    hasMissingPrices: funds.some(fund => fund.valueIls === null),
    fxApproximate: purchases.some(purchase => rateAtPurchase(purchase, fx).isApproximate),
  };
};

// Falls back to the earliest known rate so a purchase older than the fetched window is not dropped.
const fxCloseOnOrBefore = (fxCloses: DailyClose[], date: string) =>
  (resolveCloseOnOrBefore(fxCloses, date) ?? fxCloses[0])?.close ?? null;

export const purchaseAmountIls = (purchase: InvestmentPurchase, fxCloses: DailyClose[] | null) => {
  if (purchase.currency === 'ILS') {
    return purchase.amount;
  }

  const rate = fxCloses ? fxCloseOnOrBefore(fxCloses, purchase.date) : null;

  return rate === null ? null : purchase.amount * rate;
};

export const buildPurchaseMarkers = (
  purchases: InvestmentPurchase[],
  fxCloses: DailyClose[] | null
): PurchaseMarker[] =>
  purchases.flatMap(purchase => {
    const amountIls = purchaseAmountIls(purchase, fxCloses);

    return amountIls === null
      ? []
      : [{ id: purchase.id, date: purchase.date, yahooSymbol: purchase.yahooSymbol, amountIls }];
  });

const tradingDates = (closesBySymbol: Map<string, DailyClose[]>, from: string) => {
  const dates = new Set<string>();

  for (const closes of closesBySymbol.values()) {
    closes.forEach(close => close.date >= from && dates.add(close.date));
  }

  return [...dates].sort();
};

// Walks each series forward once, so a day one market is closed inherits that market's last close.
// Funds and FX keep separate cursors because TASE, US/UK and FX calendars all differ.
export const buildHistorySeries = (
  purchases: InvestmentPurchase[],
  closesBySymbol: Map<string, DailyClose[]>,
  fxCloses: DailyClose[] | null,
  from: string
): HistoryPoint[] => {
  const byDate = [...purchases]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(purchase => ({ purchase, amountIls: purchaseAmountIls(purchase, fxCloses) ?? 0 }));
  const currencyBySymbol = new Map(purchases.map(p => [p.yahooSymbol, p.currency]));
  const cursors = new Map([...closesBySymbol.keys()].map(symbol => [symbol, { next: 0, close: 0 }]));
  const fxCursor = { next: 0, close: 0 };
  const unitsHeld = new Map<string, number>();
  let boughtIndex = 0;
  let invested = 0;

  return tradingDates(closesBySymbol, from).map(date => {
    while (boughtIndex < byDate.length && byDate[boughtIndex].purchase.date <= date) {
      const { purchase, amountIls } = byDate[boughtIndex++];

      invested += amountIls;
      unitsHeld.set(purchase.yahooSymbol, (unitsHeld.get(purchase.yahooSymbol) ?? 0) + purchase.units);
    }

    while (fxCloses && fxCursor.next < fxCloses.length && fxCloses[fxCursor.next].date <= date) {
      fxCursor.close = fxCloses[fxCursor.next++].close;
    }

    let value = 0;

    for (const [symbol, closes] of closesBySymbol) {
      const cursor = cursors.get(symbol)!;

      while (cursor.next < closes.length && closes[cursor.next].date <= date) {
        cursor.close = closes[cursor.next++].close;
      }

      const rate = currencyBySymbol.get(symbol) === 'USD' ? fxCursor.close : 1;

      value += (unitsHeld.get(symbol) ?? 0) * cursor.close * rate;
    }

    return { date, invested, value };
  });
};

export const MAX_TREND_POINTS = 30;

export const downsampleEvenly = (values: number[], maxPoints = MAX_TREND_POINTS) => {
  if (values.length <= maxPoints) {
    return values;
  }

  const step = (values.length - 1) / (maxPoints - 1);

  return Array.from({ length: maxPoints }, (_, index) => values[Math.round(index * step)]);
};

export const downsampleWeekly = (points: HistoryPoint[]): HistoryPoint[] => {
  if (points.length <= MAX_HISTORY_POINTS) {
    return points;
  }

  const lastOfWeek = new Map<string, HistoryPoint>();

  for (const point of points) {
    lastOfWeek.set(mondayOfWeekIso(point.date), point);
  }

  return [...lastOfWeek.values()];
};
