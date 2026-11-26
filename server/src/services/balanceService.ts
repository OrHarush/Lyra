import {
  BalanceBreakdownEntry,
  BalanceBreakdownResult,
  BalanceBreakdownTransactionType,
  fromCents,
  toCents,
} from '@lyra/shared';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import mongoose from 'mongoose';

import { ApiError } from '../errors/ApiError';
import Account from '../models/Account';
import * as accountRepository from '../repositories/accountRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import { GetBalanceForecastQuery } from '../schemas/accountSchemas';
import { ITransactionPopulated } from '../types/Transaction';
import { getEffectiveBalanceDate, signedDeltaForAccount } from '../utils/transaction';
import { findScheduledTransactions } from './balance/findScheduledTransactions';
import {
  balanceSinceCheckpoint,
  forecastBalance,
  isWithinWindow,
  toBalanceDeltas,
  toBudgetMonth,
} from './balance/ledger';
import { getActiveWorkspaceIdOrThrow } from './workspaceService';

dayjs.extend(utc);

const buildBreakdownEntry = (
  tx: ITransactionPopulated,
  accountId: string,
  checkpointDate: Date,
  now: Date
): BalanceBreakdownEntry => {
  const effectiveDate = getEffectiveBalanceDate(tx);
  const pm = tx.paymentMethod;
  const type = tx.type as BalanceBreakdownTransactionType;

  const base: Omit<BalanceBreakdownEntry, 'included' | 'contributesToSum' | 'reason'> = {
    _id: String(tx._id),
    name: tx.name ?? '',
    date: tx.date ? new Date(tx.date).toISOString() : new Date(0).toISOString(),
    amount: tx.amount,
    type,
    paymentMethodType: pm?.type ?? null,
    billingDay: pm?.billingDay ?? null,
    effectiveBalanceDate: effectiveDate.toISOString(),
  };

  if (tx.isAwaitingApproval) {
    return { ...base, included: false, contributesToSum: 0, reason: 'bill awaiting approval' };
  }

  const isCounted = isWithinWindow(effectiveDate, { after: checkpointDate, upTo: now });

  if (!isCounted && effectiveDate <= checkpointDate) {
    return {
      ...base,
      included: false,
      contributesToSum: 0,
      reason: 'effectiveBalanceDate <= checkpointDate',
    };
  }

  if (!isCounted) {
    return {
      ...base,
      included: false,
      contributesToSum: 0,
      reason: 'effectiveBalanceDate > now (future)',
    };
  }

  if (type === 'Income') {
    return {
      ...base,
      included: true,
      contributesToSum: signedDeltaForAccount(tx, accountId),
      reason: 'Income → +amount',
    };
  }

  if (type === 'Expense') {
    return {
      ...base,
      included: true,
      contributesToSum: signedDeltaForAccount(tx, accountId),
      reason: 'Expense → -amount',
    };
  }

  const fromIsThis = tx.fromAccount?._id.toString() === accountId;
  const toIsThis = tx.toAccount?._id.toString() === accountId;

  if (!fromIsThis && !toIsThis) {
    return {
      ...base,
      included: false,
      contributesToSum: 0,
      reason: 'Transfer leg does not reference this account',
    };
  }

  const reasonParts: string[] = [];

  if (fromIsThis) reasonParts.push('fromAccount matches → -amount');
  if (toIsThis) reasonParts.push('toAccount matches → +amount');

  return {
    ...base,
    included: true,
    contributesToSum: signedDeltaForAccount(tx, accountId),
    reason: `Transfer: ${reasonParts.join(' & ')}`,
  };
};

export const computeAccountBalance = async (
  workspaceId: string,
  accountId: string
): Promise<BalanceBreakdownResult> => {
  const account = await Account.findOne({
    _id: accountId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  const checkpointDate = account.checkpointDate ?? new Date(0);
  const now = dayjs.utc().add(3, 'hours').toDate();

  const queryFrom = dayjs.utc(checkpointDate).subtract(1, 'month').startOf('month').toDate();

  const rawTransactions = await transactionRepository.findMany(workspaceId, {
    accountId,
    from: queryFrom,
  });

  let totalSkippedPreCheckpoint = 0;
  let totalSkippedFuture = 0;
  const breakdown: BalanceBreakdownEntry[] = [];

  for (const tx of rawTransactions) {
    const entry = buildBreakdownEntry(tx, accountId, checkpointDate, now);
    breakdown.push(entry);

    if (entry.reason.startsWith('effectiveBalanceDate <= checkpointDate')) {
      totalSkippedPreCheckpoint++;
    } else if (entry.reason.startsWith('effectiveBalanceDate > now')) {
      totalSkippedFuture++;
    }
  }

  const finalBalance = balanceSinceCheckpoint(
    account.checkpointBalance,
    toBalanceDeltas(rawTransactions, accountId),
    { after: checkpointDate, upTo: now }
  );

  return {
    accountId,
    accountName: account.name,
    checkpointBalance: account.checkpointBalance,
    checkpointDate: checkpointDate.toISOString(),
    now: now.toISOString(),
    totalIncluded: finalBalance - account.checkpointBalance,
    totalSkippedPreCheckpoint,
    totalSkippedFuture,
    finalBalance,
    breakdown,
  };
};

export const getBalanceForecast = async (
  workspaceId: string,
  accountId: string,
  { year, month }: GetBalanceForecastQuery
) => {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw ApiError.badRequest('Invalid account ID');
  }

  const { finalBalance, now, checkpointDate } = await computeAccountBalance(
    workspaceId,
    accountId
  );
  const targetMonth = dayjs.utc(new Date(Date.UTC(year, month, 1)));
  // Card purchases from last month are still unpaid, and rows dated next month can belong to
  // the target month (card cycle or "belongs to previous month").
  const transactions = await findScheduledTransactions(workspaceId, {
    accountId,
    from: dayjs.utc(now).subtract(1, 'month').startOf('month').toDate(),
    to: targetMonth.add(1, 'month').endOf('month').toDate(),
  });
  const forecast = forecastBalance(
    toBalanceDeltas(transactions, accountId),
    {
      currentBalance: finalBalance,
      now: new Date(now),
      checkpointDate: new Date(checkpointDate),
    },
    toBudgetMonth({ year, month })
  );

  return {
    currentBalance: fromCents(forecast.currentBalance),
    expectedIncome: fromCents(forecast.expectedIncome),
    expectedExpenses: fromCents(forecast.expectedExpenses),
    projectedBalance: fromCents(forecast.projectedBalance),
  };
};

export const syncAccountBalance = async (workspaceId: string, accountId: string) => {
  const result = await computeAccountBalance(workspaceId, accountId);

  const account = await Account.findOne({
    _id: accountId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  account.balance = result.finalBalance;
  await account.save();

  return { balance: account.balance, syncedAt: new Date(result.now) };
};

export const setBalanceCheckpoint = async (
  workspaceId: string,
  accountId: string,
  balance: number
) => {
  const account = await Account.findOne({
    _id: accountId,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });

  if (!account) {
    throw ApiError.notFound('Account not found');
  }

  account.checkpointBalance = toCents(balance);
  account.checkpointDate = new Date();

  await account.save();

  return syncAccountBalance(workspaceId, accountId);
};

// Called from the auth flow at login (before workspaceContextMiddleware runs), so we bridge userId→workspaceId here.
export const syncAllAccountsForUser = async (userId: string) => {
  const workspaceId = (await getActiveWorkspaceIdOrThrow(userId)).toString();
  const accounts = await accountRepository.findMany(workspaceId);

  const results = await Promise.allSettled(
    accounts.map(a => syncAccountBalance(workspaceId, a._id.toString()))
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const accountId = accounts[index]._id.toString();
      console.error(`Balance sync failed for account ${accountId}:`, result.reason);
    }
  });
};
