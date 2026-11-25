import { CategoryTrend, CategoryTrendMonth } from '@lyra/shared';
import dayjs, { Dayjs } from 'dayjs';

export const RANGE_OPTIONS = [3, 6, 12] as const;

export type TrendRange = (typeof RANGE_OPTIONS)[number];

export type TrendSort = 'amount' | 'date';

export const DEFAULT_RANGE: TrendRange = 6;

export interface TrendChartRow {
  period: string;
  label: string;
  total: number;
  budget: number | null;
}

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const toMonthKey = (date: Dayjs) => date.format('YYYY-MM');

export const isMonthKey = (value: string | null): value is string =>
  value !== null && MONTH_KEY_PATTERN.test(value);

export const clampMonth = (month: string, periods: string[]) => {
  if (periods.length === 0) {
    return month;
  }

  if (month < periods[0]) {
    return periods[0];
  }

  return month > periods[periods.length - 1] ? periods[periods.length - 1] : month;
};

export const findMonthEntry = (category: CategoryTrend, period: string) =>
  category.months.find(entry => entry.period === period);

const sumTotals = (months: CategoryTrendMonth[]) => months.reduce((sum, m) => sum + m.total, 0);

export const sortCategoriesForMonth = (categories: CategoryTrend[], period: string) =>
  [...categories].sort(
    (a, b) =>
      (findMonthEntry(b, period)?.total ?? 0) - (findMonthEntry(a, period)?.total ?? 0) ||
      sumTotals(b.months) - sumTotals(a.months)
  );

export const defaultRangeFor = (month: string, periods: string[]): TrendRange => {
  const index = periods.indexOf(month);
  const monthsBack = index === -1 ? periods.length : periods.length - index;

  return RANGE_OPTIONS.find(option => option >= DEFAULT_RANGE && option >= monthsBack) ?? 12;
};

export const buildPlaceholderTrend = (
  category: Pick<CategoryTrend, 'categoryId' | 'name' | 'key' | 'color' | 'icon'>,
  periods: string[]
): CategoryTrend => ({
  ...category,
  months: periods.map(period => ({
    period,
    total: 0,
    budget: null,
    delta: { kind: 'none', absolute: 0, basis: 'fullMonth' },
  })),
});

const formatMonthLabel = (period: string, isFirstOfYear: boolean) =>
  dayjs(`${period}-01`).format(isFirstOfYear ? 'MMM YY' : 'MMM');

export const buildChartRows = (category: CategoryTrend, visiblePeriods: string[]): TrendChartRow[] =>
  visiblePeriods.map((period, index) => {
    const entry = findMonthEntry(category, period);
    const isFirstOfYear = index === 0 || period.endsWith('-01');

    return {
      period,
      label: formatMonthLabel(period, isFirstOfYear),
      total: entry?.total ?? 0,
      budget: entry?.budget ?? null,
    };
  });

export const formatMonthTitle = (period: string) => dayjs(`${period}-01`).format('MMMM YYYY');
