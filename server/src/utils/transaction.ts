import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Types } from 'mongoose';

import { IRecurringTemplatePopulated } from '../types/RecurringTemplate';
import { ITransactionPopulated } from '../types/Transaction';

dayjs.extend(utc);

export const expandTransfer = (tx: ITransactionPopulated) => {
  if (tx.type !== 'Transfer' || !tx.fromAccount || !tx.toAccount) {
    return [tx];
  }

  return [
    {
      ...tx,
      _id: `${tx._id}-out`,
      originalId: tx._id,
      account: tx.fromAccount,
      amount: Math.abs(tx.amount),
      category: {
        _id: 'transfer',
        name: 'Transfer',
        icon: 'SwapHoriz',
        color: '#ff6b6b',
        type: 'Expense' as const,
        monthlyLimit: 0,
        userId: new Types.ObjectId(tx.userId),
      },
    } as ITransactionPopulated,
    {
      ...tx,
      _id: `${tx._id}-in`,
      originalId: tx._id,
      account: tx.toAccount,
      amount: Math.abs(tx.amount),
      category: {
        _id: 'transfer',
        name: 'Transfer',
        icon: 'SwapHoriz',
        color: '#51cf66',
        type: 'Income' as const,
        monthlyLimit: 0,
        userId: new Types.ObjectId(tx.userId),
      },
    } as ITransactionPopulated,
  ];
};

export const expandTransactions = (
  transactions: ITransactionPopulated[]
): ITransactionPopulated[] => transactions.flatMap(tx => expandTransfer(tx));

export const signedDeltaForAccount = (
  tx: ITransactionPopulated,
  accountId: string
): number => {
  if (tx.type === 'Income') {
    return tx.amount;
  }

  if (tx.type === 'Expense') {
    return -tx.amount;
  }

  if (tx.type !== 'Transfer') {
    return 0;
  }

  const fromMatches = tx.fromAccount?._id.toString() === accountId;
  const toMatches = tx.toAccount?._id.toString() === accountId;

  return (fromMatches ? -tx.amount : 0) + (toMatches ? tx.amount : 0);
};

export const buildTransactionQuery = (
  workspaceId: string,
  from?: Date,
  to?: Date,
  categoryIds?: string[],
  paymentMethodIds?: string[],
  accountIds?: string[]
) => {
  const workspaceObjId = new Types.ObjectId(workspaceId);

  const query: any = {
    workspaceId: workspaceObjId,
  };

  if (from || to) {
    const dateRange: any = {};

    if (from) {
      dateRange.$gte = from;
    }

    if (to) {
      dateRange.$lte = to;
    }

    query.date = dateRange;
  }

  if (categoryIds?.length) {
    query.category = { $in: categoryIds.map(id => new Types.ObjectId(id)) };
  }

  if (paymentMethodIds?.length) {
    query.paymentMethod = { $in: paymentMethodIds.map(id => new Types.ObjectId(id)) };
  }

  if (accountIds?.length) {
    const accIds = accountIds.map(id => new Types.ObjectId(id));
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { account: { $in: accIds } },
        { fromAccount: { $in: accIds } },
        { toAccount: { $in: accIds } },
      ],
    });
  }

  return query;
};

export const filterTemplatesByQueryFilters = (
  templates: IRecurringTemplatePopulated[],
  categoryIds?: string[],
  paymentMethodIds?: string[],
  accountIds?: string[]
) =>
  templates.filter(template => {
    if (categoryIds?.length) {
      const categoryId = template.category?._id?.toString();

      if (!categoryId || !categoryIds.includes(categoryId)) {
        return false;
      }
    }

    if (paymentMethodIds?.length) {
      const paymentMethodId = template.paymentMethod?._id?.toString();

      if (!paymentMethodId || !paymentMethodIds.includes(paymentMethodId)) {
        return false;
      }
    }

    if (accountIds?.length) {
      const matchesAccount = [
        template.account?._id,
        template.fromAccount?._id,
        template.toAccount?._id,
      ]
        .filter(Boolean)
        .some(id => accountIds.includes(id!.toString()));

      if (!matchesAccount) {
        return false;
      }
    }

    return true;
  });

export const filterTransactionsByDateRange = (
  transactions: ITransactionPopulated[],
  from?: Date,
  to?: Date
) =>
  transactions.filter(tx => {
    const txDate = dayjs(tx.date);

    if (from && txDate.isBefore(from, 'day')) {
      return false;
    }

    return !((to && txDate.isSame(to, 'day')) || txDate.isAfter(to, 'day'));
  });

export const sumIncomeAndExpenses = (transactions: { type: string; amount: number }[]) =>
  transactions.reduce(
    (totals, tx) => {
      if (tx.type === 'Income') {
        totals.income += tx.amount;
      }

      if (tx.type === 'Expense') {
        totals.expenses += tx.amount;
      }

      return totals;
    },
    { income: 0, expenses: 0 }
  );

export const sortAndPaginate = (
  data: any[],
  sort: 'asc' | 'desc' = 'desc',
  page?: number,
  limit?: number,
  sortBy: 'date' | 'amount' = 'date'
) => {
  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'amount' && a.amount !== b.amount) {
      return sort === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }

    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();

    if (aDate !== bDate) {
      return sort === 'asc' ? aDate - bDate : bDate - aDate;
    }

    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return sort === 'asc' ? aCreated - bCreated : bCreated - aCreated;
  });

  const total = sorted.length;
  const paginated = page && limit ? sorted.slice((page - 1) * limit, page * limit) : sorted;

  return {
    data: paginated,
    pagination:
      page && limit
        ? {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }
        : undefined,
  };
};

export function getEffectiveMonth(tx: ITransactionPopulated) {
  const date = dayjs(tx.date);

  if (tx.type !== 'Transfer') {
    const pm = tx.paymentMethod;

    if (pm && pm.type === 'Credit Card' && typeof pm.billingDay === 'number') {
      const billingDay = pm.billingDay;

      if (date.date() < billingDay) {
        const prev = date.subtract(1, 'month');

        return { year: prev.year(), month: prev.month() };
      }

      return { year: date.year(), month: date.month() };
    }
  }

  if (tx.belongToPreviousMonth) {
    const prev = date.subtract(1, 'month');

    return { year: prev.year(), month: prev.month() };
  }

  return { year: date.year(), month: date.month() };
}

export function getEffectiveBalanceDate(tx: ITransactionPopulated): Date {
  if (!tx.date) {
    throw new Error('Transaction date is required for balance calculation');
  }

  const date = dayjs.utc(tx.date);
  const pm = tx.paymentMethod;

  if (pm?.type === 'Credit Card' && typeof pm.billingDay === 'number') {
    const billingDay = pm.billingDay;

    if (date.date() < billingDay) {
      return date.date(billingDay).toDate();
    }

    const nextMonth = date.add(1, 'month');
    const safeDay = Math.min(billingDay, nextMonth.daysInMonth());

    return nextMonth.date(safeDay).toDate();
  }

  return date.toDate();
}

type SignedDelta = { income: number; expense: number };

const accountSignedDelta = (tx: ITransactionPopulated, accountId?: string): SignedDelta => {
  if (tx.type !== 'Transfer') {
    if (accountId && tx.account?._id.toString() !== accountId) {
      return { income: 0, expense: 0 };
    }

    if (tx.category?.type === 'Income') {
      return { income: tx.amount, expense: 0 };
    }

    if (tx.category?.type === 'Expense') {
      return { income: 0, expense: tx.amount };
    }

    return { income: 0, expense: 0 };
  }

  if (!accountId) {
    return { income: 0, expense: 0 };
  }

  let income = 0;
  let expense = 0;

  if (tx.fromAccount?._id.toString() === accountId) {
    expense += tx.amount;
  }

  if (tx.toAccount?._id.toString() === accountId) {
    income += tx.amount;
  }

  return { income, expense };
};

const isBeforeMonth = (year: number, month: number, targetYear: number, targetMonth: number) =>
  year < targetYear || (year === targetYear && month < targetMonth);

export const summarizeSingleMonth = (
  txs: ITransactionPopulated[],
  targetYear: number,
  targetMonth: number,
  accountId?: string,
  from?: Date,
  now?: Date
) => {
  const endOfTargetMonth = dayjs
    .utc(new Date(Date.UTC(targetYear, targetMonth, 1)))
    .endOf('month')
    .toDate();

  let monthlyIncome = 0;
  let monthlyExpenses = 0;
  let pendingPriorIncome = 0;
  let pendingPriorExpenses = 0;

  for (const tx of txs) {
    const { year, month } = getEffectiveMonth(tx);
    const effectiveDate = tx.date ? getEffectiveBalanceDate(tx) : undefined;

    if (year === targetYear && month === targetMonth) {
      if (from && now && effectiveDate && effectiveDate <= now) {
        continue;
      }

      const { income, expense } = accountSignedDelta(tx, accountId);
      monthlyIncome += income;
      monthlyExpenses += expense;
      continue;
    }

    if (
      now &&
      effectiveDate &&
      isBeforeMonth(year, month, targetYear, targetMonth) &&
      effectiveDate > now &&
      effectiveDate <= endOfTargetMonth
    ) {
      const { income, expense } = accountSignedDelta(tx, accountId);
      pendingPriorIncome += income;
      pendingPriorExpenses += expense;
    }
  }

  return { monthlyIncome, monthlyExpenses, pendingPriorIncome, pendingPriorExpenses };
};

export const summarizeWholeYear = (
  txs: ITransactionPopulated[],
  year: number,
  accountId?: string
) => {
  const buckets = Array.from({ length: 12 }, (_, m) => ({
    month: m,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  }));

  for (const tx of txs) {
    const { year: effYear, month: effMonth } = getEffectiveMonth(tx);

    if (effYear !== year) continue;

    if (tx.type !== 'Transfer') {
      if (!accountId || tx.account?._id.toString() === accountId) {
        if (tx.category?.type === 'Income') {
          buckets[effMonth].monthlyIncome += tx.amount;
        }
        if (tx.category?.type === 'Expense') {
          buckets[effMonth].monthlyExpenses += tx.amount;
        }
      }
    }

    if (tx.type === 'Transfer' && accountId) {
      if (tx.fromAccount?._id.toString() === accountId) {
        buckets[effMonth].monthlyExpenses += tx.amount;
      }

      if (tx.toAccount?._id.toString() === accountId) {
        buckets[effMonth].monthlyIncome += tx.amount;
      }
    }
  }

  return buckets;
};
