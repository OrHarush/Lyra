import { describe, expect, it } from 'vitest';

import {
  balanceAt,
  BalanceDelta,
  balanceSinceCheckpoint,
  forecastBalance,
  toBalanceDeltas,
} from '../../src/services/balance/ledger';
import {
  ACCOUNT_ID,
  category,
  creditCard,
  day,
  expense,
  income,
  OTHER_ACCOUNT_ID,
  transfer,
} from './fixtures';

const NOW = day('2026-11-10');

const delta = (
  amount: number,
  isoDay: string,
  { isVirtual = false, budgetMonth = isoDay.slice(0, 7) } = {}
): BalanceDelta => ({
  amount,
  effectiveDate: day(isoDay),
  budgetMonth,
  isVirtual,
});

describe('toBalanceDeltas', () => {
  it('gives each row its budget month', () => {
    const deltas = toBalanceDeltas(
      [
        expense(1, '2026-12-29', { belongToPreviousMonth: true }),
        expense(1, '2026-12-01', { paymentMethod: creditCard(10) }),
        expense(1, '2026-12-10', { paymentMethod: creditCard(10) }),
        expense(1, '2026-12-10'),
      ],
      ACCOUNT_ID
    );

    expect(deltas.map(d => d.budgetMonth)).toEqual(['2026-11', '2026-11', '2026-12', '2026-12']);
  });

  it('signs rows by transaction type, whatever the category', () => {
    const deltas = toBalanceDeltas(
      [
        expense(5, '2026-11-01', { category: category('Savings') }),
        income(7, '2026-11-02', { category: category('Savings') }),
        expense(3, '2026-11-03', { category: undefined }),
      ],
      ACCOUNT_ID
    );

    expect(deltas.map(d => d.amount)).toEqual([-500, 700, -300]);
  });

  it('signs a transfer by its direction', () => {
    const deltas = toBalanceDeltas(
      [
        transfer(4, '2026-11-01', ACCOUNT_ID, OTHER_ACCOUNT_ID),
        transfer(9, '2026-11-02', OTHER_ACCOUNT_ID, ACCOUNT_ID),
      ],
      ACCOUNT_ID
    );

    expect(deltas.map(d => d.amount)).toEqual([-400, 900]);
  });

  it('dates a card purchase on the billing day', () => {
    const [before, onDay] = toBalanceDeltas(
      [
        expense(1, '2026-11-09', { paymentMethod: creditCard(10) }),
        expense(1, '2026-11-10', { paymentMethod: creditCard(10) }),
      ],
      ACCOUNT_ID
    );

    expect(before.effectiveDate).toEqual(day('2026-11-10'));
    expect(onDay.effectiveDate).toEqual(day('2026-12-10'));
  });

  it('drops rows of other accounts and rows without a date', () => {
    const deltas = toBalanceDeltas(
      [expense(1, '2026-11-01'), expense(1, '2026-11-01', { date: undefined })],
      OTHER_ACCOUNT_ID
    );

    expect(deltas).toEqual([]);
  });
});

describe('balanceSinceCheckpoint', () => {
  it('counts real rows after the checkpoint up to now', () => {
    const balance = balanceSinceCheckpoint(
      1000,
      [
        delta(-1, '2026-11-01'),
        delta(-20, '2026-11-02'),
        delta(-300, '2026-11-10'),
        delta(-4000, '2026-11-11'),
        delta(-50_000, '2026-11-05', { isVirtual: true }),
      ],
      { after: day('2026-11-01'), upTo: NOW }
    );

    expect(balance).toBe(680);
  });
});

describe('forecastBalance', () => {
  const anchor = { currentBalance: 1000, now: NOW };

  it('adds every unpaid row whose budget month is the target month or earlier', () => {
    const forecast = forecastBalance(
      [
        delta(-1, '2026-11-10'),
        delta(500, '2026-11-20', { isVirtual: true }),
        delta(-200, '2026-12-29', { budgetMonth: '2026-11' }),
        delta(-30, '2026-11-15', { budgetMonth: '2026-10' }),
        delta(-100, '2026-12-05'),
      ],
      anchor,
      '2026-11'
    );

    expect(forecast).toEqual({
      currentBalance: 1000,
      expectedIncome: 500,
      expectedExpenses: 230,
      projectedBalance: 1270,
    });
  });

  it('includes the months in between when looking further ahead', () => {
    const deltas = [delta(-100, '2026-11-20'), delta(-100, '2026-12-20'), delta(-100, '2027-01-20')];

    expect(forecastBalance(deltas, anchor, '2027-01').projectedBalance).toBe(700);
  });
});

describe('balanceAt', () => {
  const deltas = [delta(-100, '2026-11-05'), delta(-7, '2026-11-06', { isVirtual: true }), delta(-30, '2026-11-20')];
  const anchor = { currentBalance: 1000, now: NOW };

  it('walks back over real rows only', () => {
    expect(balanceAt(day('2026-11-04'), deltas, anchor)).toBe(1100);
  });

  it('walks forward from now', () => {
    expect(balanceAt(day('2026-11-19'), deltas, anchor)).toBe(1000);
    expect(balanceAt(day('2026-11-20'), deltas, anchor)).toBe(970);
  });
});
