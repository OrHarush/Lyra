import { CategoryTrendsResponse } from '@lyra/shared';
import { z } from 'zod';

import * as readModel from '../readModel';
import { loadReference, resolveName, resolveNames } from './reference';
import {
  defineTool,
  formatYearMonth,
  parseYearMonth,
  roundMoney,
  UNTRUSTED_TEXT_NOTICE,
  YearMonth,
  yearMonthArg,
} from './toolKit';

const DEFAULT_MONTHS = 6;
const MAX_MONTHS = 12;

type CategoryTrend = CategoryTrendsResponse['categories'][number];

export const analyzeSpending = defineTool({
  name: 'analyzeSpending',
  title: 'Analyze spending over time',
  description:
    'Spending analysis across months: income/expenses/net per month, and expenses per category per ' +
    "month with its budget and the latest month's change vs the month before. Use for trends, " +
    '"where does my money go", budget performance and month-over-month comparisons. For individual ' +
    'transactions or merchant totals use searchTransactions. ' +
    UNTRUSTED_TEXT_NOTICE,
  inputSchema: {
    endMonth: yearMonthArg.describe(
      'Last month to include, YYYY-MM. Defaults to the current month.'
    ),
    months: z
      .number()
      .int()
      .min(1)
      .max(MAX_MONTHS)
      .optional()
      .describe(`How many months ending at endMonth. Default ${DEFAULT_MONTHS}.`),
    categories: z
      .array(z.string().min(1))
      .max(20)
      .optional()
      .describe('Only return these expense categories (names). Omit for all.'),
    account: z.string().optional().describe('Limit to one account (name).'),
  },
  run: async (args, { workspaceId }) => {
    const reference = await loadReference(workspaceId);
    const end = parseYearMonth(args.endMonth);
    const monthCount = args.months ?? DEFAULT_MONTHS;
    const accountId = resolveName('accounts', args.account, reference.accounts);
    const categoryIds = resolveNames('categories', args.categories, reference.categories);
    const periods = listPeriods(end, monthCount);

    const [trends, byMonth] = await Promise.all([
      readModel.getCategoryTrends(workspaceId, {
        endYear: end.year,
        endMonth: end.monthIndex,
        months: monthCount,
        accountId,
      }),
      loadMonthlyTotals(workspaceId, periods, accountId),
    ]);

    const categories = trends.categories.filter(
      category => !categoryIds || categoryIds.includes(category.categoryId)
    );

    return {
      periods: periods.map(formatYearMonth),
      asOf: trends.asOf,
      byMonth,
      byCategory: categories
        .map(category => presentCategory(category, monthCount))
        .filter(category => category.total > 0 || category.months.some(m => m.budget !== null))
        .sort((a, b) => b.total - a.total),
    };
  },
});

const listPeriods = (end: YearMonth, count: number): YearMonth[] =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(end.year, end.monthIndex - (count - 1 - index), 1));

    return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
  });

const loadMonthlyTotals = async (workspaceId: string, periods: YearMonth[], accountId?: string) => {
  const years = [...new Set(periods.map(period => period.year))];
  const yearly = await Promise.all(
    years.map(async year => ({
      year,
      buckets: await readModel.getMonthSummary(workspaceId, {
        year,
        month: undefined,
        accountId,
        from: undefined,
      }),
    }))
  );

  return periods.map(period => {
    const buckets = yearly.find(entry => entry.year === period.year)?.buckets;
    const bucket = Array.isArray(buckets)
      ? buckets.find(entry => entry.month === period.monthIndex)
      : undefined;
    const income = bucket?.monthlyIncome ?? 0;
    const expenses = bucket?.monthlyExpenses ?? 0;

    return {
      period: formatYearMonth(period),
      income,
      expenses,
      net: roundMoney(income - expenses),
    };
  });
};

const presentCategory = (category: CategoryTrend, monthCount: number) => {
  const total = roundMoney(category.months.reduce((sum, month) => sum + month.total, 0));
  const latest = category.months[category.months.length - 1];

  return {
    category: category.name,
    total,
    monthlyAverage: roundMoney(total / monthCount),
    latestMonthChange:
      latest?.delta.kind === 'percent'
        ? { percent: latest.delta.percent ?? null, absolute: latest.delta.absolute }
        : null,
    months: category.months.map(month => ({
      period: month.period,
      total: month.total,
      budget: month.budget,
    })),
  };
};
