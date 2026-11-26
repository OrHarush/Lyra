import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { balanceAt, forecastBalance, toBalanceDeltas } from '../../src/services/balance/ledger';
import { balanceSinceCheckpoint } from '../../src/services/balance/ledger';
import { ACCOUNT_ID, creditCard, day, expense } from './fixtures';

const NOW = day('2026-11-10');
const CHECKPOINT = day('2026-11-01');
const anchor = { currentBalance: 100_000, now: NOW, checkpointDate: CHECKPOINT };

const waitingBill = (amount: number, isoDay: string) =>
  expense(amount, isoDay, { isAwaitingApproval: true, templateId: new Types.ObjectId() });

const deltasOf = (...bills: ReturnType<typeof expense>[]) => toBalanceDeltas(bills, ACCOUNT_ID);

describe('a bill awaiting approval', () => {
  it('is not part of the current balance', () => {
    const balance = balanceSinceCheckpoint(100_000, deltasOf(waitingBill(300, '2026-11-05')), {
      after: CHECKPOINT,
      upTo: NOW,
    });

    expect(balance).toBe(100_000);
  });

  it('stays in the projection once overdue', () => {
    const forecast = forecastBalance(
      deltasOf(waitingBill(300, '2026-11-05')),
      anchor,
      '2026-11'
    );

    expect(forecast.expectedExpenses).toBe(30_000);
    expect(forecast.projectedBalance).toBe(70_000);
  });

  it('is counted once when charged later by card', () => {
    const bill = expense(300, '2026-11-05', {
      isAwaitingApproval: true,
      paymentMethod: creditCard(15),
    });

    expect(forecastBalance(deltasOf(bill), anchor, '2026-11').expectedExpenses).toBe(30_000);
    expect(balanceAt(day('2026-11-30'), deltasOf(bill), anchor)).toBe(70_000);
  });

  it('is left out when dated before the balance checkpoint', () => {
    const deltas = deltasOf(waitingBill(300, '2026-10-20'));

    expect(forecastBalance(deltas, anchor, '2026-11').projectedBalance).toBe(100_000);
    expect(balanceAt(day('2026-11-30'), deltas, anchor)).toBe(100_000);
  });

  it('does not rewrite past calendar days, and lowers today onward', () => {
    const deltas = deltasOf(waitingBill(300, '2026-11-05'));

    expect(balanceAt(day('2026-11-03'), deltas, anchor)).toBe(100_000);
    expect(balanceAt(day('2026-11-07'), deltas, anchor)).toBe(100_000);
    expect(balanceAt(NOW, deltas, anchor)).toBe(70_000);
    expect(balanceAt(day('2026-11-20'), deltas, anchor)).toBe(70_000);
  });
});
