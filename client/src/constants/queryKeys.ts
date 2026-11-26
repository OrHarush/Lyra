import { AccountDto } from '@/types/Account';

export const queryKeys = {
  allTransactions: () => ['transactions'],
  transactions: (filters?: {
    year?: number;
    month?: number;
    categoryIds?: string[];
    accountIds?: string[];
    paymentMethodIds?: string[];
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) => ['transactions', filters ?? {}],
  transaction: (id: string) => ['transactions', id],
  transactionSummary: (year: number, month: number, accountId: string) => [
    'transactionSummary',
    year,
    month,
    accountId,
  ],
  // Nested under 'transactionSummary' so every existing summary invalidation refreshes forecasts.
  balanceForecast: (year: number, month: number, account: AccountDto) => [
    'transactionSummary',
    'forecast',
    year,
    month,
    account._id,
    account.balance,
    account.checkpointDate,
  ],
  transactionCalendar: (from: string, to: string, accountId: string) => [
    'transactions',
    'calendar',
    from,
    to,
    accountId,
  ],
  recentTransactions: (accountId: string, limit: number) => [
    'transactions',
    'recent',
    accountId,
    limit,
  ],
  // Nested under 'transactions' so every existing allTransactions() invalidation refreshes trends.
  allCategoryTrends: () => ['transactions', 'categoryTrends'],
  categoryTrends: (endMonth: string, months: number, accountId?: string) => [
    'transactions',
    'categoryTrends',
    endMonth,
    months,
    accountId ?? 'all',
  ],
  categoryTransactions: (categoryId: string, month: string, sort: string) => [
    'transactions',
    'categoryTrends',
    'list',
    categoryId,
    month,
    sort,
  ],
  transactionsCount: () => ['transactions', 'count'],
  transactionsReviewCount: () => ['transactions', 'reviewCount'],
  transactionsReview: () => ['transactions', 'review'],
  quickChips: () => ['transactions', 'quickChips'],
  // Nested under 'transactions' so creating or editing a recurring transaction refreshes the list.
  fixedExpenses: () => ['transactions', 'fixedExpenses'],
  recurringTemplates: () => ['recurringTemplates'],

  accounts: () => ['accounts'],
  account: (id: string) => ['accounts', id],
  accountBalance: (accountId: string, asOf: string) => ['accountBalance', accountId, asOf],

  categories: () => ['categories'],
  category: (id: string) => ['categories', id],

  budgets: (year: number, month?: number, categoryId?: string) => {
    const key: (string | number)[] = ['budgets', year];

    if (month !== undefined) {
      key.push(month);
    }

    if (categoryId !== undefined) {
      key.push(categoryId);
    }

    return key;
  },
  budget: (id: string) => ['budgets', id],

  goals: (filter?: { status?: string }) => ['goals', filter ?? {}],
  allGoals: () => ['goals'],
  goal: (id: string) => ['goals', id],
  goalProjection: (id: string) => ['goals', 'projection', id],
  goalGhosts: (month: string) => ['goals', 'ghosts', month],
  allGoalGhosts: () => ['goals', 'ghosts'],

  allInvestments: () => ['investments'],
  investmentSummary: () => ['investments', 'summary'],
  investmentPurchases: () => ['investments', 'purchases'],
  investmentPurchaseTrends: () => ['investments', 'purchases', 'trends'],
  investmentHistory: (range: string, symbols: string[]) => [
    'investments',
    'history',
    range,
    [...symbols].sort().join(','),
  ],
  investmentInstrumentSearch: (query: string) => ['investments', 'instruments', query],

  paymentMethods: () => ['paymentMethods'],
  yearlyChart: (year: number) => ['yearlyChart', year],

  user: () => ['user'],

  adminAnalytics: () => ['admin-analytics'],
  adminRetention: () => ['admin-retention'],
  adminRecentActivity: () => ['admin-recent-activity'],
  adminUsers: () => ['admin-users'],
  adminDebugSnapshots: () => ['admin', 'debug-snapshots'],
  adminBalanceBreakdown: (accountId?: string) => ['admin', 'balance-breakdown', accountId ?? null],

  workspaces: () => ['workspaces'],
  invitation: (token: string) => ['invitation', token],

  mcpConnections: () => ['mcpConnections'],
  mcpConsentRequest: (requestId: string) => ['mcpConsentRequest', requestId],
};
