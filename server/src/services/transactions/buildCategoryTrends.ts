import { CategoryTrendsResponse, TrendDelta, TrendDeltaBasis } from '@lyra/shared';

import { IBudget } from '../../models/Budget';
import { ITransactionPopulated } from '../../types/Transaction';
import { getEffectiveMonth } from '../../utils/transaction';

export const MIN_BASE_CENTS = 100 * 100;
export const MIN_MONTH_TO_DATE_DAY = 7;
export const MAX_PERCENT = 999;

const MS_PER_DAY = 86_400_000;

interface MonthRef {
  year: number;
  month: number;
}

interface MonthSpend {
  full: number;
  toDate: number;
}

interface CategoryInfo {
  name: string;
  key?: string;
  color?: string;
  icon?: string;
}

export interface BuildCategoryTrendsInput {
  transactions: ITransactionPopulated[];
  budgets: IBudget[];
  endYear: number;
  endMonth: number;
  months: number;
  now: Date;
  accountId?: string;
}

interface TrendDeltaInput {
  current: number;
  previous: number;
  basis: TrendDeltaBasis;
  dayOfMonth: number;
}

const toPeriodKey = ({ year, month }: MonthRef) =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

const shiftMonth = ({ year, month }: MonthRef, offset: number): MonthRef => {
  const index = year * 12 + month + offset;

  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
};

const buildPeriods = (endYear: number, endMonth: number, months: number) =>
  Array.from({ length: months }, (_, i) =>
    shiftMonth({ year: endYear, month: endMonth }, i - (months - 1))
  );

// A card purchase can land one month earlier than its calendar month, and a
// belongToPreviousMonth item one month earlier still, so the window is padded on both ends.
export const getTrendsFetchWindow = (endYear: number, endMonth: number, months: number) => {
  const firstPeriod = shiftMonth({ year: endYear, month: endMonth }, -(months - 1));
  const beforeFirst = shiftMonth(firstPeriod, -1);
  const afterEnd = shiftMonth({ year: endYear, month: endMonth }, 2);

  return {
    from: new Date(Date.UTC(beforeFirst.year, beforeFirst.month, 1)),
    to: new Date(Date.UTC(afterEnd.year, afterEnd.month, 1)),
  };
};

export const computeTrendDelta = ({
  current,
  previous,
  basis,
  dayOfMonth,
}: TrendDeltaInput): TrendDelta => {
  const absolute = current - previous;
  const none: TrendDelta = { kind: 'none', absolute, basis };

  if (basis === 'monthToDate' && dayOfMonth < MIN_MONTH_TO_DATE_DAY) {
    return none;
  }

  if (current === 0 && previous === 0) {
    return none;
  }

  if (previous === 0) {
    return { kind: 'new', absolute, basis };
  }

  if (previous < MIN_BASE_CENTS) {
    return absolute === 0 ? none : { kind: 'smallBase', absolute, basis };
  }

  const percent = Math.round((absolute / previous) * 100);

  if (percent === 0) {
    return none;
  }

  return {
    kind: 'percent',
    percent: Math.max(-MAX_PERCENT, Math.min(MAX_PERCENT, percent)),
    absolute,
    basis,
  };
};

const isTrackedExpense = (tx: ITransactionPopulated, accountId?: string) => {
  if (tx.type !== 'Expense' || tx.category?.type !== 'Expense' || !tx.date) {
    return false;
  }

  return !accountId || tx.account?._id.toString() === accountId;
};

const dayNumberInEffectiveMonth = (tx: ITransactionPopulated, { year, month }: MonthRef) =>
  Math.floor((new Date(tx.date!).getTime() - Date.UTC(year, month, 1)) / MS_PER_DAY) + 1;

const collectSpend = (
  transactions: ITransactionPopulated[],
  todayNumber: number,
  accountId?: string
) => {
  const spend = new Map<string, Map<string, MonthSpend>>();
  const categories = new Map<string, CategoryInfo>();

  for (const tx of transactions) {
    if (!isTrackedExpense(tx, accountId)) {
      continue;
    }

    const category = tx.category!;
    const categoryId = category._id.toString();
    const effective = getEffectiveMonth(tx);
    const periodKey = toPeriodKey(effective);
    const byPeriod = spend.get(categoryId) ?? new Map<string, MonthSpend>();
    const entry = byPeriod.get(periodKey) ?? { full: 0, toDate: 0 };

    entry.full += tx.amount;

    if (dayNumberInEffectiveMonth(tx, effective) <= todayNumber) {
      entry.toDate += tx.amount;
    }

    byPeriod.set(periodKey, entry);
    spend.set(categoryId, byPeriod);
    categories.set(categoryId, {
      name: category.name,
      key: category.key,
      color: category.color,
      icon: category.icon,
    });
  }

  return { spend, categories };
};

const indexBudgets = (budgets: IBudget[]) =>
  new Map(
    budgets.map(b => [
      `${b.categoryId.toString()}:${toPeriodKey({ year: b.year, month: b.month })}`,
      b.limit,
    ])
  );

export const buildCategoryTrends = ({
  transactions,
  budgets,
  endYear,
  endMonth,
  months,
  now,
  accountId,
}: BuildCategoryTrendsInput): CategoryTrendsResponse => {
  const periods = buildPeriods(endYear, endMonth, months);
  const currentKey = toPeriodKey({ year: now.getUTCFullYear(), month: now.getUTCMonth() });
  const todayNumber = now.getUTCDate();
  const budgetByKey = indexBudgets(budgets);
  const { spend, categories } = collectSpend(transactions, todayNumber, accountId);

  const trends = [...spend.entries()].map(([categoryId, byPeriod]) => {
    const monthEntries = periods.map(period => {
      const key = toPeriodKey(period);
      const isCurrent = key === currentKey;
      const basis: TrendDeltaBasis = isCurrent ? 'monthToDate' : 'fullMonth';
      const entry = byPeriod.get(key);
      const previous = byPeriod.get(toPeriodKey(shiftMonth(period, -1)));
      const pick = (s?: MonthSpend) => (isCurrent ? (s?.toDate ?? 0) : (s?.full ?? 0));

      return {
        period: key,
        total: entry?.full ?? 0,
        budget: budgetByKey.get(`${categoryId}:${key}`) ?? null,
        delta: computeTrendDelta({
          current: pick(entry),
          previous: pick(previous),
          basis,
          dayOfMonth: todayNumber,
        }),
      };
    });

    return { categoryId, ...categories.get(categoryId)!, months: monthEntries };
  });

  const windowTotal = (c: (typeof trends)[number]) => c.months.reduce((s, m) => s + m.total, 0);
  const endTotal = (c: (typeof trends)[number]) => c.months[c.months.length - 1].total;

  const withSpend = trends
    .filter(c => windowTotal(c) > 0)
    .sort((a, b) => endTotal(b) - endTotal(a) || windowTotal(b) - windowTotal(a));

  return { periods: periods.map(toPeriodKey), asOf: now.toISOString(), categories: withSpend };
};
