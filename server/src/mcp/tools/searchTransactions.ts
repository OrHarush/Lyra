import { z } from 'zod';

import { ITransactionPopulated } from '../../types/Transaction';
import * as readModel from '../readModel';
import { loadReference, resolveNames, WorkspaceReference } from './reference';
import {
  defineTool,
  isoDayArg,
  monthBounds,
  nameListArg,
  nowInLyraTime,
  parseYearMonth,
  roundMoney,
  toIsoDay,
  ToolInputError,
  UNTRUSTED_TEXT_NOTICE,
  yearMonthArg,
} from './toolKit';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const MAX_RANGE_DAYS = 731;
const DAY_MS = 24 * 60 * 60 * 1000;

type FoundTransaction = ITransactionPopulated & { amount: number };

export const searchTransactions = defineTool({
  name: 'searchTransactions',
  title: 'Search transactions',
  description:
    'Find individual transactions and get exact totals for any filter, e.g. "how much did I spend at ' +
    'Wolt this year" or "my 10 largest expenses last month". Filter by month or date range, type, ' +
    'category / account / payment-method names, text in the name, and amount range. Totals (count, ' +
    'income, expenses, net) cover every match, not just the returned page. Includes projected ' +
    'recurring items inside the range (isProjected). Defaults to the current month. ' +
    UNTRUSTED_TEXT_NOTICE,
  inputSchema: {
    month: yearMonthArg.describe(
      "Month as YYYY-MM, using Lyra's billing-aware month. Use either month or from/to."
    ),
    from: isoDayArg.describe('Range start, YYYY-MM-DD (inclusive). Max range is 2 years.'),
    to: isoDayArg.describe(
      'Range end, YYYY-MM-DD (inclusive). Defaults to today when from is set.'
    ),
    type: z.enum(['Income', 'Expense', 'Transfer']).optional(),
    categories: nameListArg('Category'),
    accounts: nameListArg('Account'),
    paymentMethods: nameListArg('Payment method'),
    search: z.string().max(50).optional().describe('Text contained in the transaction name.'),
    minAmount: z.number().nonnegative().optional(),
    maxAmount: z.number().nonnegative().optional(),
    sortBy: z.enum(['date', 'amount']).optional().describe('Default date.'),
    order: z.enum(['asc', 'desc']).optional().describe('Default desc.'),
    limit: z.number().int().min(1).max(MAX_LIMIT).optional().describe(`Default ${DEFAULT_LIMIT}.`),
    offset: z.number().int().min(0).optional().describe('Rows to skip, for paging. Default 0.'),
  },
  run: async (args, { workspaceId }) => {
    const reference = await loadReference(workspaceId);
    const window = resolveWindow(args);

    const found = await readModel.findTransactions(workspaceId, {
      ...window,
      categoryIds: resolveNames('categories', args.categories, reference.categories),
      accountIds: resolveNames('accounts', args.accounts, reference.accounts),
      paymentMethodIds: resolveNames(
        'payment methods',
        args.paymentMethods,
        reference.paymentMethods
      ),
      search: args.search,
    });

    const matches = (found.data as FoundTransaction[])
      .filter(tx => !args.type || tx.type === args.type)
      .filter(tx => args.minAmount === undefined || tx.amount >= args.minAmount)
      .filter(tx => args.maxAmount === undefined || tx.amount <= args.maxAmount);

    const sorted = sortTransactions(matches, args.sortBy ?? 'date', args.order ?? 'desc');
    const offset = args.offset ?? 0;
    const limit = args.limit ?? DEFAULT_LIMIT;
    const page = sorted.slice(offset, offset + limit);

    return {
      range: describeWindow(window),
      totals: sumTotals(matches),
      offset,
      returned: page.length,
      hasMore: offset + page.length < sorted.length,
      transactions: page.map(tx => presentTransaction(tx, reference)),
    };
  },
});

interface QueryWindow {
  from: Date;
  to: Date;
  targetYear?: number;
  targetMonth?: number;
}

// Mirrors the REST month filter: fetch through the end of the next month so items booked to the
// previous month (belongToPreviousMonth) are still caught, then keep only the effective month.
const monthWindow = (month?: string): QueryWindow => {
  const period = parseYearMonth(month);
  const { start } = monthBounds(period);
  const next = monthBounds({ year: period.year, monthIndex: period.monthIndex + 1 });

  return {
    from: start,
    to: next.end,
    targetYear: period.year,
    targetMonth: period.monthIndex,
  };
};

const resolveWindow = (args: { month?: string; from?: string; to?: string }): QueryWindow => {
  if (args.month && (args.from || args.to)) {
    throw new ToolInputError('Use either month or from/to, not both.');
  }

  if (!args.from && !args.to) {
    return monthWindow(args.month);
  }

  if (!args.from) {
    throw new ToolInputError('from is required when to is set.');
  }

  const from = new Date(`${args.from}T00:00:00.000Z`);
  const to = new Date(`${args.to ?? toIsoDay(nowInLyraTime())}T23:59:59.999Z`);

  if (from > to) {
    throw new ToolInputError('from must not be after to.');
  }

  if ((to.getTime() - from.getTime()) / DAY_MS > MAX_RANGE_DAYS) {
    throw new ToolInputError('The date range is limited to 2 years per call.');
  }

  return { from, to };
};

const describeWindow = (window: QueryWindow) =>
  window.targetYear !== undefined && window.targetMonth !== undefined
    ? { month: `${window.targetYear}-${String(window.targetMonth + 1).padStart(2, '0')}` }
    : { from: toIsoDay(window.from), to: toIsoDay(window.to) };

const sortTransactions = (
  transactions: FoundTransaction[],
  sortBy: 'date' | 'amount',
  order: 'asc' | 'desc'
) => {
  const direction = order === 'asc' ? 1 : -1;
  const keyOf = (tx: FoundTransaction) =>
    sortBy === 'amount' ? tx.amount : new Date(tx.date ?? 0).getTime();

  return [...transactions].sort((a, b) => (keyOf(a) - keyOf(b)) * direction);
};

const sumTotals = (transactions: FoundTransaction[]) => {
  const sumOf = (type: string) =>
    roundMoney(transactions.filter(tx => tx.type === type).reduce((sum, tx) => sum + tx.amount, 0));
  const income = sumOf('Income');
  const expenses = sumOf('Expense');

  return { count: transactions.length, income, expenses, net: roundMoney(income - expenses) };
};

const presentTransaction = (tx: FoundTransaction, reference: WorkspaceReference) => ({
  date: tx.date ? toIsoDay(new Date(tx.date)) : null,
  name: tx.name ?? null,
  type: tx.type,
  amount: tx.amount,
  category: tx.category?.name ?? null,
  account: tx.account?.name ?? reference.nameOf(tx.account) ?? null,
  fromAccount: tx.fromAccount?.name ?? null,
  toAccount: tx.toAccount?.name ?? null,
  paymentMethod: tx.paymentMethod ? reference.nameOf(tx.paymentMethod._id) : null,
  isRecurring: Boolean(tx.templateId),
  isProjected: Boolean(tx.isVirtual),
});
