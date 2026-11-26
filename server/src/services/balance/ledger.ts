import { ITransactionPopulated } from '../../types/Transaction';
import { getEffectiveBalanceDate, signedDeltaForAccount } from '../../utils/transaction';

// The single set of rules for account balances: money moves on its balance date, and everything
// that leaves the account lowers it. Spending reports group by month and category elsewhere.

export interface BalanceDelta {
  effectiveDate: Date;
  amount: number;
  isVirtual: boolean;
}

export interface BalanceAnchor {
  currentBalance: number;
  now: Date;
}

export interface BalanceForecast {
  currentBalance: number;
  expectedIncome: number;
  expectedExpenses: number;
  projectedBalance: number;
}

interface DateWindow {
  after: Date;
  upTo: Date;
}

export const toBalanceDeltas = (
  transactions: ITransactionPopulated[],
  accountId: string
): BalanceDelta[] =>
  transactions
    .filter(tx => !!tx.date && touchesAccount(tx, accountId))
    .map(tx => ({
      effectiveDate: getEffectiveBalanceDate(tx),
      amount: signedDeltaForAccount(tx, accountId),
      isVirtual: !!tx.isVirtual,
    }))
    .filter(delta => delta.amount !== 0);

export const isWithinWindow = (effectiveDate: Date, { after, upTo }: DateWindow) =>
  effectiveDate > after && effectiveDate <= upTo;

export const balanceSinceCheckpoint = (
  checkpointBalance: number,
  deltas: BalanceDelta[],
  window: DateWindow
) => checkpointBalance + sumAmounts(selectSettled(selectWithin(deltas, window)));

export const forecastBalance = (
  deltas: BalanceDelta[],
  { currentBalance, now }: BalanceAnchor,
  upTo: Date
): BalanceForecast => {
  const upcoming = selectWithin(deltas, { after: now, upTo });
  const expectedIncome = sumAmounts(upcoming.filter(delta => delta.amount > 0));
  const expectedExpenses = Math.abs(sumAmounts(upcoming.filter(delta => delta.amount < 0)));

  return {
    currentBalance,
    expectedIncome,
    expectedExpenses,
    projectedBalance: currentBalance + expectedIncome - expectedExpenses,
  };
};

export const balanceAt = (moment: Date, deltas: BalanceDelta[], anchor: BalanceAnchor) => {
  if (moment >= anchor.now) {
    return forecastBalance(deltas, anchor, moment).projectedBalance;
  }

  const settledSince = selectSettled(selectWithin(deltas, { after: moment, upTo: anchor.now }));

  return anchor.currentBalance - sumAmounts(settledSince);
};

const touchesAccount = (tx: ITransactionPopulated, accountId: string) =>
  [tx.account, tx.fromAccount, tx.toAccount].some(account => account?._id.toString() === accountId);

const selectWithin = (deltas: BalanceDelta[], window: DateWindow) =>
  deltas.filter(delta => isWithinWindow(delta.effectiveDate, window));

// Which rows are real money today. Forecasts count every row, settled or not.
const selectSettled = (deltas: BalanceDelta[]) => deltas.filter(delta => !delta.isVirtual);

const sumAmounts = (deltas: BalanceDelta[]) =>
  deltas.reduce((total, delta) => total + delta.amount, 0);
