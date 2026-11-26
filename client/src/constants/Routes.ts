export const ROUTES = {
  HOME_URL: '/',
  LOGIN_URL: '/login',
  TERMS_OF_SERVICE_URL: '/terms-of-service',
  PRIVACY_POLICY_URL: '/privacy-policy',
  ACCESSIBILITY_URL: '/accessibility',
  BLOG_URL: '/blog',
  BLOG_RISEUP_REVIEW_URL: '/blog/riseup-review',
  BLOG_CASHFLOW_GUIDE_URL: '/blog/cashflow-guide',
  BLOG_FREE_EXPENSE_APPS_URL: '/blog/free-expense-apps-comparison',
  BLOG_CREDIT_CARD_BILLING_CYCLE_URL: '/blog/credit-card-billing-cycle',
  BLOG_COUPLES_MONEY_URL: '/blog/couples-money',
  OVERVIEW_URL: '/overview',
  TRANSACTIONS_URL: '/transactions',
  CATEGORY_TRENDS_URL: '/category-trends',
  CATEGORIES_URL: '/categories',
  PAYMENT_METHODS_URL: '/payment-methods',
  BUDGETS_URL: '/budget',
  GOALS_URL: '/goals',
  GOAL_DETAIL_URL: '/goals/:id',
  CALCULATORS_URL: '/calculators',
  CALCULATORS_NET_SALARY_URL: '/calculators/net-salary',
  CALCULATORS_COMPOUND_INTEREST_URL: '/calculators/compound-interest',
  TOOLS_URL: '/tools',
  TOOLS_NET_SALARY_URL: '/tools/net-salary',
  TOOLS_COMPOUND_INTEREST_URL: '/tools/compound-interest',
  INVESTMENTS_URL: '/investments',
  ACCOUNTS_URL: '/accounts',
  ADMIN_KPIS_URL: '/admin/kpis',
  ADMIN_DEBUG_URL: '/admin/debug',
  CHAT_URL: '/chat',
  IMPORT_URL: '/transactions/import',
  TRANSACTIONS_REVIEW_URL: '/transactions/review',
  INVITATION_URL: '/invitations/:token',
  SHORTCUT_AUTH_URL: '/shortcut-auth',
  MCP_CONSENT_URL: '/oauth/consent',
} as const;

export const buildInvitationUrl = (token: string) => `/invitations/${token}`;

export const API_ROUTES = {
  AUTH: {
    GOOGLE_LOGIN: '/api/auth/google-login',
    ACCEPT_TERMS: '/api/auth/accept-terms',
    ME: '/api/auth/me',
    DEV_LOGIN: '/api/auth/dev-login',
  },

  FEEDBACK: '/api/feedback',
  FEEDBACK_SURVEY_ELIGIBILITY: '/api/feedback/survey-eligibility',
  FEEDBACK_SURVEY_SEEN: '/api/feedback/survey-seen',

  MONTHLY_REPORT_ELIGIBILITY: (month: string) => `/api/monthly-report/eligibility?month=${month}`,
  MONTHLY_REPORT_SEEN: '/api/monthly-report/seen',

  TRANSACTIONS: '/api/transactions',
  CATEGORY_TRENDS: '/api/transactions/category-trends',
  TRANSACTIONS_RECENT: (accountId: string, limit: number) =>
    `/api/transactions?${new URLSearchParams({ accountIds: accountId, page: '1', limit: String(limit), sort: 'desc' })}`,
  TRANSACTIONS_EXPORT: (month: string) => `/api/transactions/export?month=${month}`,
  TRANSACTION_QUICK_CHIPS: '/api/transactions/quick-chips',
  TRANSACTIONS_REVIEW: '/api/transactions/review',
  TRANSACTIONS_REVIEW_COUNT: '/api/transactions/review-count',
  RECURRING_TEMPLATES_WITH_TRANSACTIONS: '/api/recurring-templates/with-transactions',
  RECURRING_TEMPLATES_SPLIT: (id: string) => `/api/recurring-templates/${id}/split`,
  RECURRING_TEMPLATES_DEACTIVATE_FROM: (id: string) => `/api/recurring-templates/${id}/deactivate-from`,
  RECURRING_TEMPLATES_MATERIALIZE: (id: string) => `/api/recurring-templates/${id}/materialize`,
  TRANSACTION_CALENDAR: (from: string, to: string, accountId?: string) => {
    const params = new URLSearchParams({ from, to });

    if (accountId) {
      params.append('accountId', accountId);
    }

    return `/api/transactions/calendar?${params.toString()}`;
  },
  TRANSACTION_SUMMARY: (year: number, month?: number, accountId?: string) => {
    const params = new URLSearchParams({ year: String(year) });

    if (month !== undefined) {
      params.append('month', String(month));
    }

    if (accountId) {
      params.append('accountId', accountId);
    }

    return `/api/transactions/summary?${params.toString()}`;
  },

  ACCOUNTS: '/api/accounts',
  ACCOUNT_BY_ID: (id: string) => `/api/accounts/${id}`,
  ACCOUNT_FORECAST: (accountId: string, year: number, month: number) =>
    `/api/accounts/${accountId}/forecast?${new URLSearchParams({ year: String(year), month: String(month) })}`,

  CATEGORIES: '/api/categories',

  PAYMENT_METHODS: '/api/payment-methods',
  PAYMENT_METHODS_DEFAULT_BANK_TRANSFER: '/api/payment-methods/defaults/bank-transfer',

  BUDGETS: '/api/budgets',

  GOALS: '/api/goals',
  GOAL_BY_ID: (id: string) => `/api/goals/${id}`,
  GOAL_PROJECTION: (id: string) => `/api/goals/${id}/projection`,
  GOAL_DELETE: (id: string, keepCategory: boolean) =>
    `/api/goals/${id}?keepCategory=${keepCategory}`,
  GOAL_GHOSTS: (month: string) => `/api/goals/ghosts?month=${month}`,

  INVESTMENTS: {
    INSTRUMENT_SEARCH: (query: string) => `/api/investments/instruments/search?q=${encodeURIComponent(query)}`,
    PURCHASES: '/api/investments/purchases',
    PURCHASE_TRENDS: '/api/investments/purchases/trends',
    PURCHASE_BY_ID: (id: string) => `/api/investments/purchases/${id}`,
    SUMMARY: '/api/investments/summary',
    HISTORY: (range: string, symbols: string[]) =>
      `/api/investments/history?range=${range}${
        symbols.length > 0 ? `&symbols=${encodeURIComponent(symbols.join(','))}` : ''
      }`,
  },

  USERS: '/api/users',
  USERS_ME: '/api/users/me',
  USERS_PREFERENCES: '/api/users/me/preferences',
  USERS_ACTIVE_WORKSPACE: '/api/users/me/active-workspace',
  USERS_CONSENT: '/api/users/me/consent',
  USERS_EXPORT: '/api/users/me/export',

  ADMIN: '/api/admin',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_BACKUP: '/api/admin/backup',
  ADMIN_RECENT_ACTIVITY: (cursor?: string, limit?: number) => {
    const params = new URLSearchParams();

    if (cursor) {
      params.append('cursor', cursor);
    }

    if (limit !== undefined) {
      params.append('limit', String(limit));
    }

    const qs = params.toString();

    return qs ? `/api/admin/analytics/activity?${qs}` : '/api/admin/analytics/activity';
  },
  ADMIN_DEBUG: {
    RUN_FOR_ME: '/api/admin/debug/run-for-me',
    RESTORE_FOR_ME: '/api/admin/debug/restore-for-me',
    SNAPSHOTS: '/api/admin/debug/snapshots',
    SNAPSHOT_DELETE: (id: string) => `/api/admin/debug/snapshots/${id}`,
    BALANCE_BREAKDOWN: (accountId?: string) =>
      accountId
        ? `/api/admin/debug/balance-breakdown?accountId=${encodeURIComponent(accountId)}`
        : '/api/admin/debug/balance-breakdown',
  },

  CHAT: '/api/chat',

  SHORTCUT: {
    INIT: '/api/shortcut/init',
    APPROVE: '/api/shortcut/approve',
    TOKEN: '/api/shortcut/token',
    STATUS: '/api/shortcut/status',
    REVOKE: '/api/shortcut/revoke',
    MACRO: '/api/shortcut/macro',
    CONNECTION: '/api/shortcut/connection',
  },

  MCP: {
    OAUTH_REQUEST: (requestId: string) => `/api/mcp/oauth/requests/${encodeURIComponent(requestId)}`,
    OAUTH_APPROVE: (requestId: string) =>
      `/api/mcp/oauth/requests/${encodeURIComponent(requestId)}/approve`,
    OAUTH_DENY: (requestId: string) =>
      `/api/mcp/oauth/requests/${encodeURIComponent(requestId)}/deny`,
    CONNECTIONS: '/api/mcp/connections',
    CONNECTION_BY_ID: (connectionId: string) =>
      `/api/mcp/connections/${encodeURIComponent(connectionId)}`,
    PERSONAL_TOKEN: '/api/mcp/connections/personal',
  },

  IMPORT_PREVIEW: '/api/import/preview',
  IMPORT_TRANSACTIONS: '/api/import/transactions',
  IMPORT_CHECK_DUPLICATES: '/api/import/check-duplicates',

  ANALYTICS_SHARE_CLICK: '/api/analytics/share-click',
  ANALYTICS_PWA_INSTALL: '/api/analytics/pwa-install',
  ANALYTICS_CATEGORY_TRENDS_VIEW: '/api/analytics/category-trends-view',

  WORKSPACES: '/api/workspaces',
  WORKSPACE_BY_ID: (workspaceId: string) => `/api/workspaces/${workspaceId}`,
  WORKSPACE_INVITATIONS: (workspaceId: string) =>
    `/api/workspaces/${workspaceId}/invitations`,
  WORKSPACE_INVITATION_BY_ID: (workspaceId: string, invitationId: string) =>
    `/api/workspaces/${workspaceId}/invitations/${invitationId}`,
  WORKSPACE_LEAVE: (workspaceId: string) => `/api/workspaces/${workspaceId}/leave`,
  WORKSPACE_MEMBER: (workspaceId: string, userId: string) =>
    `/api/workspaces/${workspaceId}/members/${userId}`,
  WORKSPACE_EXPORT: (workspaceId: string) => `/api/workspaces/${workspaceId}/export`,
  PUBLIC_INVITATION: (token: string) => `/api/invitations/${token}`,
  INVITATION_ACCEPT: (token: string) => `/api/invitations/${token}/accept`,
  INVITATION_DECLINE: (token: string) => `/api/invitations/${token}/decline`,
};
