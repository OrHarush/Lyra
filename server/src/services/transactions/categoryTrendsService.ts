import { CategoryTrendsResponse, fromCents } from '@lyra/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import * as budgetRepository from '../../repositories/budgetRepository';
import * as recurringTemplateRepository from '../../repositories/recurringTemplateRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import { GetCategoryTrendsQuery } from '../../schemas/transactionSchemas';
import { buildCategoryTrends, getTrendsFetchWindow } from './buildCategoryTrends';
import { buildVirtualTransactions } from './buildVirtualTransactions';

dayjs.extend(utc);

// Matches the +3h shift the dashboard summary uses so "today" agrees across endpoints.
const nowForUser = () => dayjs.utc().add(3, 'hours').toDate();

const toDisplayUnits = (trends: CategoryTrendsResponse): CategoryTrendsResponse => ({
  ...trends,
  categories: trends.categories.map(category => ({
    ...category,
    months: category.months.map(month => ({
      ...month,
      total: fromCents(month.total),
      budget: month.budget === null ? null : fromCents(month.budget),
      delta: { ...month.delta, absolute: fromCents(month.delta.absolute) },
    })),
  })),
});

export const getCategoryTrends = async (
  workspaceId: string,
  { endYear, endMonth, months, accountId }: GetCategoryTrendsQuery
) => {
  const { from, to } = getTrendsFetchWindow(endYear, endMonth, months);

  const [transactions, templates, budgets] = await Promise.all([
    transactionRepository.findExpensesInRange(workspaceId, from, to, accountId),
    recurringTemplateRepository.findActiveForDateRangePopulated(workspaceId, from, to),
    budgetRepository.findInYearRange(workspaceId, from.getUTCFullYear(), to.getUTCFullYear()),
  ]);

  const virtual = buildVirtualTransactions(templates, transactions, from, to);

  const trends = buildCategoryTrends({
    transactions: [...transactions, ...virtual],
    budgets,
    endYear,
    endMonth,
    months,
    now: nowForUser(),
    accountId,
  });

  return toDisplayUnits(trends);
};
