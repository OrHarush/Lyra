// @ts-nocheck
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Types } from 'mongoose';

import { GetTransactionsOptions } from '../schemas/transactionSchemas';
import * as accountService from '../services/accountService';
import * as budgetService from '../services/budgetService';
import * as categoryService from '../services/categoryService';
import * as paymentMethodService from '../services/paymentMethodService';
import * as transactionService from '../services/transactions/transactionService';
import {
  AccountQuerySchema,
  BudgetQuerySchema,
  CategoryQuerySchema,
  PaymentMethodQuerySchema,
  TransactionQuerySchema,
  TransactionSummaryQuerySchema,
} from './mcpSchemas';

export interface McpRequestAuth {
  userId: string;
  workspaceId: string;
}

// Built per request: the SDK's Protocol owns one transport at a time, so a shared instance fails
// overlapping requests. The tool bodies below are unchanged; the two helpers they call now read
// the pinned user and workspace from the verified token instead of headers / active workspace.
export const createMcpServer = (auth: McpRequestAuth) => {
  const authErrorResponse = {
    content: [{ type: 'text' as const, text: 'Unauthorized: missing or invalid token' }],
    isError: true,
  };

  const extractUserIdFromContext = (_context: any): string | null => auth.userId;

  const getActiveWorkspaceIdOrThrow = async (_userId: string): Promise<Types.ObjectId> =>
    new Types.ObjectId(auth.workspaceId);

  const mcpServer = new McpServer({
    name: 'lyra',
    version: '1.0.0',
  });

  mcpServer.registerTool(
    'getTransactions',
    {
      title: 'Get Transactions',
      description:
        "Fetch the user's transactions with rich filtering. " +
        'Supports pagination, date ranges, type (Income/Expense/Transfer), ' +
        'category, payment method, and account filters. ' +
        'Use targetYear + targetMonth to get transactions effective in a specific month (recommended over raw date ranges for monthly views). ' +
        'Use this tool to list, search, or analyze individual transactions.',
      inputSchema: TransactionQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      const options: GetTransactionsOptions = {
        page: args.page,
        limit: args.limit,
        sort: args.sort,
        categoryId: args.categoryId,
        paymentMethodId: args.paymentMethodId,
        accountId: args.accountId,
        search: args.search,
        targetYear: args.targetYear,
        targetMonth: args.targetMonth,
        from: args.from ? new Date(args.from) : undefined,
        to: args.to ? new Date(args.to) : undefined,
      };

      const txWorkspaceId = await getActiveWorkspaceIdOrThrow(userId);
      const result = await transactionService.findAll(txWorkspaceId.toString(), options);
      const allData = JSON.parse(JSON.stringify(result));

      const data = {
        ...allData,
        data: allData.data
          .filter((tx: any) => (args.type ? tx.type === args.type : true))
          .filter((tx: any) =>
            args.fromAccountId ? tx.fromAccount?._id === args.fromAccountId : true
          )
          .filter((tx: any) => (args.toAccountId ? tx.toAccount?._id === args.toAccountId : true)),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        structuredContent: data,
      };
    }
  );

  mcpServer.registerTool(
    'getTransactionSummary',
    {
      title: 'Get Transaction Summary',
      description:
        'Returns aggregated financial summary data — total income, total expenses, net balance, ' +
        'and per-category breakdown. Provide just a year for a full 12-month yearly overview, ' +
        'or year + month (0=Jan) for a single month summary. Optionally scope to a specific account. ' +
        'Use this tool instead of getTransactions when you need totals, net balance, ' +
        'or category spending breakdowns rather than individual transaction details.',
      inputSchema: TransactionSummaryQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      const parsed = TransactionSummaryQuerySchema.safeParse(args);
      if (!parsed.success) {
        return {
          content: [
            { type: 'text' as const, text: 'Invalid arguments: ' + parsed.error.issues[0].message },
          ],
          isError: true,
        };
      }
      const query = parsed.data;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const summaryWorkspaceId = await getActiveWorkspaceIdOrThrow(userId);
      const summary = await transactionService.getTransactionSummary(
        summaryWorkspaceId.toString(),
        query
      );

      const data = JSON.parse(JSON.stringify(summary));
      const structured = Array.isArray(data) ? { totalMonths: data.length, months: data } : data;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(structured, null, 2) }],
        structuredContent: structured,
      };
    }
  );

  mcpServer.registerTool(
    'getAccounts',
    {
      title: 'Get Accounts',
      description:
        'Fetch all user bank/financial accounts with their current balances, institution names, account numbers,' +
        'and icons. Each account has a balance field reflecting the current synced balance. ' +
        'The primary account is the main account used for overview calculations. ' +
        'Use this tool to list accounts or get account IDs needed for filtering other tools.',
      inputSchema: AccountQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      // Bridge: accounts is workspace-scoped (Step 3); MCP context carries userId only.
      const workspaceId = await getActiveWorkspaceIdOrThrow(userId);
      let accounts = await accountService.findAll(workspaceId.toString());

      if (args.isPrimary !== undefined) {
        accounts = accounts.filter((a: any) => a.isPrimary === args.isPrimary);
      }

      if (args.search) {
        const term = args.search.toLowerCase();
        accounts = accounts.filter((a: any) => a.name.toLowerCase().includes(term));
      }

      const data = JSON.parse(JSON.stringify(accounts));
      const structured = {
        total: data.length,
        items: data,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        structuredContent: structured,
      };
    }
  );

  mcpServer.registerTool(
    'getCategories',
    {
      title: 'Get Categories',
      description:
        'Fetch all user-defined spending and income categories. Each category has a name, ' +
        'type (Income or Expense), color, and icon. Category IDs are required when filtering transactions by category. ' +
        'Use this tool first to discover category IDs before calling getTransactions or getBudgets with a categoryId filter.',
      inputSchema: CategoryQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      // Bridge: categories is workspace-scoped (Step 3); MCP context carries userId only.
      const categoriesWorkspaceId = await getActiveWorkspaceIdOrThrow(userId);
      let categories = await categoryService.findAll(categoriesWorkspaceId.toString(), userId);

      if (args.type) {
        categories = categories.filter((c: any) => c.type === args.type);
      }

      if (args.search) {
        const term = args.search.toLowerCase();
        categories = categories.filter((c: any) => c.name.toLowerCase().includes(term));
      }

      const data = JSON.parse(JSON.stringify(categories));
      const structured = {
        total: data.length,
        items: data,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        structuredContent: structured,
      };
    }
  );

  mcpServer.registerTool(
    'getPaymentMethods',
    {
      title: 'Get Payment Methods',
      description:
        'Fetch all user payment methods (credit cards, debit cards, bank transfers, PayPal, etc.). ' +
        'Each method has a name, type, optional last 4 digits, and a billing day (for credit cards). ' +
        'Payment method IDs are needed when filtering transactions by payment method. ' +
        'Use this tool to discover which payment methods the user has and their IDs.',
      inputSchema: PaymentMethodQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      // Bridge: payment methods is workspace-scoped (Step 3); MCP context carries userId only.
      const pmWorkspaceId = await getActiveWorkspaceIdOrThrow(userId);
      let methods = await paymentMethodService.findAll(pmWorkspaceId.toString());

      if (args.type) {
        methods = methods.filter((m: any) => m.type === args.type);
      }

      if (args.isPrimary !== undefined) {
        methods = methods.filter((m: any) => m.isPrimary === args.isPrimary);
      }

      if (args.search) {
        const term = args.search.toLowerCase();
        methods = methods.filter((m: any) => m.name.toLowerCase().includes(term));
      }

      const data = JSON.parse(JSON.stringify(methods));
      const structured = {
        total: data.length,
        items: data,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        structuredContent: structured,
      };
    }
  );

  mcpServer.registerTool(
    'getBudgets',
    {
      title: 'Get Budgets',
      description:
        "Fetch the user's monthly spending budgets. Each budget is tied to a specific category, year, and month, and has a spending limit. Use year + month filters to get budgets for a specific period. To compare actual spending vs budget limits, combine this tool with getTransactionSummary for the same period.",
      inputSchema: BudgetQuerySchema,
    },
    async (args, context) => {
      const userId = extractUserIdFromContext(context);

      if (!userId) {
        return authErrorResponse;
      }

      const options: any = {};

      if (args.year !== undefined) {
        options.year = args.year;
      }

      if (args.month !== undefined) {
        options.month = args.month - 1;
      }

      if (args.categoryId !== undefined) {
        options.categoryId = args.categoryId;
      }

      // Bridge: budgets is workspace-scoped (Step 3); MCP context carries userId only.
      const budgetsWorkspaceId = await getActiveWorkspaceIdOrThrow(userId);
      const budgets = await budgetService.findAll(budgetsWorkspaceId.toString(), options);
      const data = JSON.parse(JSON.stringify(budgets));
      const structured = {
        total: data.length,
        items: data,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        structuredContent: structured,
      };
    }
  );

  return mcpServer;
};
