import { CreateTransactionDTO, fromCents, toCents, UpdateTransactionDTO } from '@lyra/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import mongoose, { Types } from 'mongoose';

import { ApiError } from '../../errors/ApiError';
import Category from '../../models/Category';
import { AUTOMATION_SOURCES, ITransaction, TransactionSource } from '../../models/Transaction';
import User from '../../models/User';
import * as recurringTemplateRepository from '../../repositories/recurringTemplateRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import {
  GetTransactionCalendarQuery,
  GetTransactionsOptions,
  GetTransactionSummaryQuery,
} from '../../schemas/transactionSchemas';
import { ITransactionPopulated } from '../../types/Transaction';
import { TransactionCalendar } from '../../types/TransactionCalendar';
import { isCategoryCompatibleWithTransactionType } from '../../utils/categoryCompatibility';
import { fingerprintForTransaction } from '../../utils/importFingerprint';
import {
  expandTransactions,
  filterTemplatesByQueryFilters,
  filterTransactionsByDateRange,
  getEffectiveMonth,
  sortAndPaginate,
  summarizeSingleMonth,
  summarizeWholeYear,
} from '../../utils/transaction';
import * as accountService from '../accountService';
import * as analyticsService from '../analyticsService';
import { computeAccountBalance, syncAccountBalance } from '../balanceService';
import { buildCalendarDays, flattenEvents } from './buildCalendarDays';
import { buildVirtualTransactions } from './buildVirtualTransactions';
import { invalidateQuickChipsCache } from './quickChipsService';

dayjs.extend(utc);

const syncBalanceFor = async (workspaceId: string, accountIds: (string | undefined)[]) => {
  const unique = [...new Set(accountIds.filter(Boolean))] as string[];

  const results = await Promise.allSettled(
    unique.map(id => syncAccountBalance(workspaceId, id))
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Balance sync failed for account ${unique[index]}:`, result.reason);
    }
  });
};

type TxWithEffective = ITransactionPopulated & {
  effectiveYear: number;
  effectiveMonth: number;
};

// options is GetTransactionsQuery when called from HTTP controller (fully validated)
// and GetTransactionsOptions when called from internal callers (partial)
export const findAll = async (workspaceId: string, options: GetTransactionsOptions = {}) => {
  const {
    page,
    limit,
    from,
    to,
    targetYear,
    targetMonth,
    sort,
    search,
    categoryIds,
    paymentMethodIds,
    accountIds,
    accountId,
  } = options;
  const resolvedAccountIds = accountIds ?? (accountId ? [accountId] : undefined);

  const transactions = await transactionRepository.findMany(workspaceId, options);

  if (from && to) {
    const templates = await recurringTemplateRepository.findActiveForDateRangePopulated(
      workspaceId,
      from,
      to
    );
    const matchingTemplates = filterTemplatesByQueryFilters(
      templates,
      categoryIds,
      paymentMethodIds,
      resolvedAccountIds
    );
    const virtualTransactions = buildVirtualTransactions(
      matchingTemplates,
      transactions,
      from,
      to
    );

    transactions.push(...virtualTransactions);
  }

  const expandedTransactions = expandTransactions(transactions);

  const txWithEffectiveMonth = expandedTransactions.map(tx => {
    const { year, month } = getEffectiveMonth(tx);

    return { ...tx, effectiveYear: year, effectiveMonth: month };
  });

  let filtered = filterTransactionsByDateRange(txWithEffectiveMonth, from, to);

  if (targetYear != null && targetMonth != null) {
    filtered = (filtered as TxWithEffective[]).filter(
      tx => tx.effectiveYear === targetYear && tx.effectiveMonth === targetMonth
    );
  }

  if (search) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter(t => t.name?.toLowerCase().includes(term));
  }

  const result = sortAndPaginate(filtered, sort, page, limit);

  return {
    ...result,
    data: result.data.map(tx => ({ ...tx, amount: fromCents(tx.amount) })),
  };
};

export const getTransactionById = async (id: string, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const transaction = await transactionRepository.findById(id, workspaceId);

  if (!transaction) {
    throw ApiError.notFound('Transaction not found');
  }

  return { ...transaction, amount: fromCents(transaction.amount) };
};

export const getTransactionSummary = async (
  workspaceId: string,
  query: GetTransactionSummaryQuery
) => {
  const { year, month, accountId, from } = query;

  const targetMonthStart =
    month !== undefined ? new Date(Date.UTC(year, month, 1)) : new Date(Date.UTC(year, 0, 1));
  const fromDate = dayjs.utc(targetMonthStart).subtract(1, 'month').startOf('month').toDate();
  const endDate =
    month !== undefined
      ? new Date(Date.UTC(year, month + 2, 1))
      : new Date(Date.UTC(year + 1, 0, 1));

  const transactions = await transactionRepository.findMany(workspaceId, {
    accountId,
    from: fromDate,
    to: endDate,
  });

  const templates = await recurringTemplateRepository.findActiveForDateRangePopulated(
    workspaceId,
    fromDate,
    endDate
  );

  const virtualTransactions = buildVirtualTransactions(templates, transactions, fromDate, endDate);

  transactions.push(...virtualTransactions);

  if (month !== undefined) {
    const result = summarizeSingleMonth(
      transactions,
      year,
      month,
      accountId,
      from,
      dayjs.utc().add(3, 'hours').toDate()
    );

    return {
      monthlyIncome: fromCents(result.monthlyIncome),
      monthlyExpenses: fromCents(result.monthlyExpenses),
      pendingPriorIncome: fromCents(result.pendingPriorIncome),
      pendingPriorExpenses: fromCents(result.pendingPriorExpenses),
    };
  }

  return summarizeWholeYear(transactions, year, accountId).map(bucket => ({
    ...bucket,
    monthlyIncome: fromCents(bucket.monthlyIncome),
    monthlyExpenses: fromCents(bucket.monthlyExpenses),
  }));
};

const UPCOMING_WINDOW_DAYS = 30;

export const getTransactionCalendar = async (
  workspaceId: string,
  { from, to, accountId }: GetTransactionCalendarQuery
): Promise<TransactionCalendar> => {
  const now = dayjs.utc().add(3, 'hours');
  const rangeStart = dayjs.utc(from);
  const rangeEnd = dayjs.utc(to).endOf('day');
  const upcomingStart = now.startOf('day');
  const upcomingEnd = upcomingStart.add(UPCOMING_WINDOW_DAYS, 'day').endOf('day');
  // Starts a month early because card purchases are charged on the next billing day, and
  // always spans today so balances can be walked from the current balance to any range.
  const fetchFrom = (now.isBefore(rangeStart) ? now : rangeStart).subtract(1, 'month').toDate();
  const fetchTo = (upcomingEnd.isAfter(rangeEnd) ? upcomingEnd : rangeEnd).toDate();

  const transactions = await transactionRepository.findMany(workspaceId, {
    accountId,
    from: fetchFrom,
    to: fetchTo,
  });

  const templates = await recurringTemplateRepository.findActiveForDateRangePopulated(
    workspaceId,
    fetchFrom,
    fetchTo
  );

  transactions.push(...buildVirtualTransactions(templates, transactions, fetchFrom, fetchTo));

  const balanceContext = accountId
    ? {
        currentBalance: (await computeAccountBalance(workspaceId, accountId)).finalBalance,
        now: now.toDate(),
      }
    : undefined;

  return {
    days: buildCalendarDays(transactions, rangeStart, rangeEnd, accountId, balanceContext),
    upcoming: flattenEvents(buildCalendarDays(transactions, upcomingStart, upcomingEnd, accountId)),
  };
};

export const countAll = async (
  workspaceId: string
): Promise<{ total: number; recurringTemplates: number }> => {
  const [total, recurringTemplates] = await Promise.all([
    transactionRepository.countByWorkspace(workspaceId),
    recurringTemplateRepository.countActiveByWorkspace(workspaceId),
  ]);

  return { total, recurringTemplates };
};

export const create = async (
  data: CreateTransactionDTO,
  userId: string,
  workspaceId: string,
  source: TransactionSource = 'manual',
  sourceMerchant: string | null = null
) => {
  const isAutomation = AUTOMATION_SOURCES.includes(source);

  if ((data.type === 'Expense' || data.type === 'Income') && data.categoryId) {
    const category = await Category.findOne({
      _id: data.categoryId,
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!category) {
      throw ApiError.badRequest('Invalid category for this workspace');
    }

    if (!isCategoryCompatibleWithTransactionType(category.type, data.type)) {
      throw ApiError.badRequest(
        `Category type mismatch: category is ${category.type} but transaction is ${data.type}`
      );
    }
  }

  const mapped: Omit<ITransaction, '_id'> = {
    name: data.name ?? '',
    note: data.note,
    type: data.type,
    amount: toCents(data.amount),
    belongToPreviousMonth: data.belongToPreviousMonth ?? false,
    date: data.date ? new Date(data.date) : undefined,
    category: data.categoryId ? new Types.ObjectId(data.categoryId) : undefined,
    paymentMethod: data.paymentMethodId ? new Types.ObjectId(data.paymentMethodId) : undefined,
    account: data.accountId ? new Types.ObjectId(data.accountId) : undefined,
    fromAccount: data.fromAccountId ? new Types.ObjectId(data.fromAccountId) : undefined,
    toAccount: data.toAccountId ? new Types.ObjectId(data.toAccountId) : undefined,
    userId: new Types.ObjectId(userId),
    workspaceId: new Types.ObjectId(workspaceId),
    source,
    sourceMerchant,
    reviewedAt: isAutomation ? null : undefined,
  };

  mapped.importFingerprint = fingerprintForTransaction(mapped);

  const created = await transactionRepository.insert(mapped);

  invalidateQuickChipsCache(workspaceId);
  await syncBalanceFor(workspaceId, [data.accountId, data.fromAccountId, data.toAccountId]);
  const accounts = await accountService.findAll(workspaceId);

  void Promise.all([
    User.findByIdAndUpdate(userId, {
      $set: { lastActiveAt: new Date() },
    }),
    analyticsService.track(userId, 'transaction_created'),
  ]).catch(err => console.error('Failed to track transaction activity:', err));

  created.amount = fromCents(created.amount);

  return { transaction: created, accounts };
};

export const update = async (
  id: string,
  data: UpdateTransactionDTO,
  workspaceId: string,
  userId: string
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const existing = await transactionRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Transaction not found');
  }

  const mapped: Partial<ITransaction> = {};

  if (data.name !== undefined) mapped.name = data.name;
  if (data.note !== undefined) mapped.note = data.note;
  if (data.type !== undefined) mapped.type = data.type;
  if (data.amount !== undefined) mapped.amount = toCents(data.amount);
  if (data.belongToPreviousMonth !== undefined)
    mapped.belongToPreviousMonth = data.belongToPreviousMonth;
  if (data.date !== undefined) mapped.date = new Date(data.date);
  if (data.categoryId !== undefined) mapped.category = new Types.ObjectId(data.categoryId);
  if (data.paymentMethodId !== undefined)
    mapped.paymentMethod = new Types.ObjectId(data.paymentMethodId);
  if (data.accountId !== undefined) mapped.account = new Types.ObjectId(data.accountId);
  if (data.fromAccountId !== undefined) mapped.fromAccount = new Types.ObjectId(data.fromAccountId);
  if (data.toAccountId !== undefined) mapped.toAccount = new Types.ObjectId(data.toAccountId);

  const affectsFingerprint =
    data.date !== undefined ||
    data.amount !== undefined ||
    data.type !== undefined ||
    data.accountId !== undefined;

  if (affectsFingerprint) {
    const fingerprint = fingerprintForTransaction({
      userId,
      account: data.accountId ?? existing.account?._id?.toString(),
      date: mapped.date ?? existing.date,
      amount: mapped.amount ?? existing.amount,
      type: mapped.type ?? existing.type,
    });

    if (fingerprint) {
      mapped.importFingerprint = fingerprint;
    }
  }

  const becomesReviewed =
    AUTOMATION_SOURCES.includes(existing.source) &&
    existing.reviewedAt == null &&
    data.categoryId !== undefined;

  if (becomesReviewed) {
    mapped.reviewedAt = new Date();
  }

  const updated = await transactionRepository.updateById(id, mapped, workspaceId);

  if (!updated) {
    throw ApiError.internal('Unexpected error updating transaction');
  }

  invalidateQuickChipsCache(workspaceId);
  await syncBalanceFor(workspaceId, [
    existing.account?._id.toString(),
    existing.fromAccount?._id.toString(),
    existing.toAccount?._id.toString(),
    data.accountId,
    data.fromAccountId,
    data.toAccountId,
  ]);
  const accounts = await accountService.findAll(workspaceId);

  void analyticsService
    .track(userId, 'transaction_updated')
    .catch(err => console.error('Failed to track transaction_updated:', err));

  return { transaction: { ...updated, amount: fromCents(updated.amount) }, accounts };
};

export const deleteTransaction = async (id: string, workspaceId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const existing = await transactionRepository.findById(id, workspaceId);

  if (!existing) {
    throw ApiError.notFound('Transaction not found');
  }

  const deleted = await transactionRepository.remove(id, workspaceId);

  if (!deleted) {
    throw ApiError.internal('Unexpected error deleting transaction');
  }

  invalidateQuickChipsCache(workspaceId);
  await syncBalanceFor(workspaceId, [
    existing.account?._id.toString(),
    existing.fromAccount?._id.toString(),
    existing.toAccount?._id.toString(),
  ]);

  void analyticsService
    .track(userId, 'transaction_deleted')
    .catch(err => console.error('Failed to track transaction_deleted:', err));

  return { ...deleted, amount: fromCents(deleted.amount) };
};
