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
  }) => ['transactions', filters ?? {}],
  transaction: (id: string) => ['transactions', id],
  transactionSummary: (year: number, month: number, accountId: string, from?: string) => [
    'transactionSummary',
    year,
    month,
    accountId,
    from,
  ],
  transactionCalendar: (year: number, month: number, accountId: string) => [
    'transactions',
    'calendar',
    year,
    month,
    accountId,
  ],
  transactionsCount: () => ['transactions', 'count'],
  transactionsReviewCount: () => ['transactions', 'reviewCount'],
  transactionsReview: () => ['transactions', 'review'],
  quickChips: () => ['transactions', 'quickChips'],
  recurringTemplates: () => ['recurringTemplates'],

  accounts: () => ['accounts'],
  account: (id: string) => ['accounts', id],
  accountBalance: (accountId: string, asOf: string) => ['accountBalance', accountId, asOf],
  accountBalanceCurve: (accountId: string, from?: string, to?: string) => [
    'accountBalanceCurve',
    accountId,
    from ?? 'defaultFrom',
    to ?? 'defaultTo',
  ],

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
};
