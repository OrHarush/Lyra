import { ITransactionPopulated } from '../../types/Transaction';
import {
  getEffectiveBalanceDate,
  getEffectiveMonth,
  signedDeltaForAccount,
} from '../../utils/transaction';

// The single set of rules for account balances. Each row moves money on its balance date
// (cards: the billing day) and belongs to a budget month (the card cycle, or the previous month
// when flagged). The balance and the calendar follow the balance date; the projected balance of
// a month follows the budget month. Everything that leaves the account lowers it.

export interface BalanceDelta {
  effectiveDate: Date;
  budgetMonth: string;
  amount: number;
  isVirtual: boolean;
  isAwaitingApproval: boolean;
}

export interface BalanceAnchor {
  currentBalance: number;
  now: Date;
  checkpointDate?: Date;
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
      budgetMonth: toBudgetMonth(getEffectiveMonth(tx)),
      amount: signedDeltaForAccount(tx, accountId),
      isVirtual: !!tx.isVirtual,
      isAwaitingApproval: !!tx.isAwaitingApproval,
    }))
    .filter(delta => delta.amount !== 0);

export const toBudgetMonth = ({ year, month }: { year: number; month: number }) =>
  `${year}-${String(month + 1).padStart(2, '0')}`;

export const isWithinWindow = (effectiveDate: Date, { after, upTo }: DateWindow) =>
  effectiveDate > after && effectiveDate <= upTo;

export const balanceSinceCheckpoint = (
  checkpointBalance: number,
  deltas: BalanceDelta[],
  window: DateWindow
) => checkpointBalance + sumAmounts(selectSettled(selectWithin(deltas, window)));

// What the balance will be once everything belonging to `throughMonth` (or earlier) is paid.
export const forecastBalance = (
  deltas: BalanceDelta[],
  anchor: BalanceAnchor,
  throughMonth: string
): BalanceForecast => {
  const { currentBalance, now } = anchor;
  const upcoming = deltas.filter(
    delta =>
      (delta.effectiveDate > now || isOverdueApproval(delta, anchor)) &&
      delta.budgetMonth <= throughMonth
  );
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
    const scheduled = selectWithin(deltas, { after: anchor.now, upTo: moment });
    const overdue = deltas.filter(delta => isOverdueApproval(delta, anchor));

    return anchor.currentBalance + sumAmounts([...scheduled, ...overdue]);
  }

  const settledSince = selectSettled(selectWithin(deltas, { after: moment, upTo: anchor.now }));

  return anchor.currentBalance - sumAmounts(settledSince);
};

const touchesAccount = (tx: ITransactionPopulated, accountId: string) =>
  [tx.account, tx.fromAccount, tx.toAccount].some(account => account?._id.toString() === accountId);

const selectWithin = (deltas: BalanceDelta[], window: DateWindow) =>
  deltas.filter(delta => isWithinWindow(delta.effectiveDate, window));

// Which rows are real money today. Forecasts count every row, settled or not.
const selectSettled = (deltas: BalanceDelta[]) =>
  deltas.filter(delta => !delta.isVirtual && !delta.isAwaitingApproval);

// A due bill nobody approved yet is still expected to be paid. One dated before the checkpoint is
// left out, because the balance the user entered then may already include it.
const isOverdueApproval = (delta: BalanceDelta, { now, checkpointDate }: BalanceAnchor) =>
  delta.isAwaitingApproval &&
  delta.effectiveDate <= now &&
  (!checkpointDate || delta.effectiveDate > checkpointDate);

const sumAmounts = (deltas: BalanceDelta[]) =>
  deltas.reduce((total, delta) => total + delta.amount, 0);
