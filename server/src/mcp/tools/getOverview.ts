import { CategoryTrendsResponse } from '@lyra/shared';

import * as readModel from '../readModel';
import { loadReference, WorkspaceReference } from './reference';
import {
  defineTool,
  formatYearMonth,
  nowInLyraTime,
  parseYearMonth,
  roundMoney,
  toIsoDay,
  UNTRUSTED_TEXT_NOTICE,
  yearMonthArg,
} from './toolKit';

const TOP_CATEGORY_COUNT = 5;
const UPCOMING_LIMIT = 15;

export const getOverview = defineTool({
  name: 'getOverview',
  title: 'Financial overview',
  description:
    'Start here. One-call snapshot of the connected Lyra workspace: currency, accounts and balances, ' +
    "the month's income/expenses/net, budget status per category, top spending categories, active " +
    'goals, the next 30 days of upcoming bills and income, and the category / account / payment-method ' +
    'names other tools accept as filters. Amounts are in the workspace currency. ' +
    UNTRUSTED_TEXT_NOTICE,
  inputSchema: {
    month: yearMonthArg.describe('Month to summarize as YYYY-MM. Defaults to the current month.'),
  },
  run: async ({ month }, { userId, workspaceId }) => {
    const period = parseYearMonth(month);
    const today = toIsoDay(nowInLyraTime());

    const [workspace, reference, summary, trends, goals, calendar] = await Promise.all([
      readModel.findWorkspace(workspaceId),
      loadReference(workspaceId),
      readModel.getMonthSummary(workspaceId, {
        year: period.year,
        month: period.monthIndex,
        accountId: undefined,
        from: undefined,
      }),
      readModel.getCategoryTrends(workspaceId, {
        endYear: period.year,
        endMonth: period.monthIndex,
        months: 1,
        accountId: undefined,
      }),
      readModel.listGoals(userId, workspaceId, { status: 'active' }),
      readModel.getCashflowCalendar(workspaceId, { from: today, to: today }),
    ]);

    const monthTotals = Array.isArray(summary) ? undefined : summary;
    const income = monthTotals?.monthlyIncome ?? 0;
    const expenses = monthTotals?.monthlyExpenses ?? 0;

    return {
      workspace: { name: workspace.name, type: workspace.type, currency: workspace.currency },
      month: formatYearMonth(period),
      totals: { income, expenses, net: roundMoney(income - expenses) },
      accounts: presentAccounts(reference),
      budgets: presentBudgets(trends),
      topExpenseCategories: presentTopCategories(trends),
      activeGoals: goals.map(goal => ({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentValue: goal.currentValue,
        targetDate: toIsoDay(new Date(goal.targetDate)),
      })),
      upcoming: calendar.upcoming.slice(0, UPCOMING_LIMIT).map(({ date, event }) => ({
        date: date.slice(0, 10),
        name: event.name,
        kind: event.kind,
        amount: event.amount,
        isRecurring: event.isVirtual,
      })),
      filterOptions: presentFilterOptions(reference),
    };
  },
});

const presentAccounts = (reference: WorkspaceReference) =>
  reference.accounts.map(({ account }) => ({
    name: account.name,
    institution: account.institution ?? null,
    balance: roundMoney(account.balance / 100),
    currency: account.currency ?? null,
    isPrimary: account.isPrimary,
  }));

const latestMonthOf = (category: CategoryTrendsResponse['categories'][number]) =>
  category.months[category.months.length - 1];

const presentBudgets = (trends: CategoryTrendsResponse) =>
  trends.categories
    .filter(category => latestMonthOf(category)?.budget != null)
    .map(category => {
      const { total, budget } = latestMonthOf(category);
      const limit = budget ?? 0;

      return {
        category: category.name,
        spent: total,
        budget: limit,
        remaining: roundMoney(limit - total),
        percentUsed: limit > 0 ? Math.round((total / limit) * 100) : null,
      };
    });

const presentTopCategories = (trends: CategoryTrendsResponse) =>
  trends.categories
    .map(category => ({ category: category.name, spent: latestMonthOf(category)?.total ?? 0 }))
    .filter(category => category.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, TOP_CATEGORY_COUNT);

const presentFilterOptions = (reference: WorkspaceReference) => ({
  expenseCategories: reference.categories.filter(c => c.type === 'Expense').map(c => c.name),
  incomeCategories: reference.categories.filter(c => c.type === 'Income').map(c => c.name),
  savingsCategories: reference.categories.filter(c => c.type === 'Savings').map(c => c.name),
  accounts: reference.accounts.map(a => a.name),
  paymentMethods: reference.paymentMethods.map(p => p.name),
});
