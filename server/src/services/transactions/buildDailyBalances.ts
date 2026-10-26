import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ITransactionPopulated } from '../../types/Transaction';
import { getEffectiveBalanceDate, signedDeltaForAccount } from '../../utils/transaction';

dayjs.extend(utc);

interface BalanceDelta {
  effectiveDate: Date;
  amount: number;
  isVirtual: boolean;
}

// Anchored on the account's current balance: past days walk backward over real
// transactions, future days walk forward including virtual recurring ones.
export const buildDailyBalances = (
  transactions: ITransactionPopulated[],
  monthDays: Dayjs[],
  accountId: string,
  currentBalance: number,
  now: Date
): Map<string, number> => {
  const deltas = toBalanceDeltas(transactions, accountId);
  const balances = new Map<string, number>();

  for (const day of monthDays) {
    const endOfDay = day.endOf('day').toDate();
    const balance =
      endOfDay >= now
        ? currentBalance + sumDeltasBetween(deltas, now, endOfDay, true)
        : currentBalance - sumDeltasBetween(deltas, endOfDay, now, false);

    balances.set(day.format('YYYY-MM-DD'), balance);
  }

  return balances;
};

const toBalanceDeltas = (transactions: ITransactionPopulated[], accountId: string): BalanceDelta[] =>
  transactions
    .filter(tx => !!tx.date && touchesAccount(tx, accountId))
    .map(tx => ({
      effectiveDate: getEffectiveBalanceDate(tx),
      amount: signedDeltaForAccount(tx, accountId),
      isVirtual: !!tx.isVirtual,
    }))
    .filter(delta => delta.amount !== 0);

const touchesAccount = (tx: ITransactionPopulated, accountId: string) =>
  [tx.account, tx.fromAccount, tx.toAccount].some(account => account?._id.toString() === accountId);

const sumDeltasBetween = (
  deltas: BalanceDelta[],
  after: Date,
  upTo: Date,
  includeVirtual: boolean
) =>
  deltas
    .filter(delta => includeVirtual || !delta.isVirtual)
    .filter(delta => delta.effectiveDate > after && delta.effectiveDate <= upTo)
    .reduce((total, delta) => total + delta.amount, 0);
