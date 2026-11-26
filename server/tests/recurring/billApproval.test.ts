import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import {
  confirmsAwaitingBill,
  estimateBillAmount,
  isDueForApproval,
  selectBillsAssignedTo,
} from '../../src/services/bills/billApproval';
import { day } from '../balance/fixtures';

describe('isDueForApproval', () => {
  const bill = { kind: 'bill' as const, createdAt: new Date('2026-11-10T14:00:00.000Z') };

  it('waits for occurrences from the day the bill was set up', () => {
    expect(isDueForApproval(bill, day('2026-11-10'))).toBe(true);
    expect(isDueForApproval(bill, day('2026-12-10'))).toBe(true);
  });

  it('records back-filled history as approved', () => {
    expect(isDueForApproval(bill, day('2026-10-10'))).toBe(false);
  });

  it('never waits for anything but bills', () => {
    expect(isDueForApproval({ ...bill, kind: 'subscription' }, day('2026-12-10'))).toBe(false);
    expect(isDueForApproval({ createdAt: bill.createdAt }, day('2026-12-10'))).toBe(false);
  });
});

describe('estimateBillAmount', () => {
  it('averages recent approved amounts in cents', () => {
    expect(estimateBillAmount([30_000, 31_000, 33_001], 10_000)).toBe(31_334);
  });

  it('falls back to the amount on the bill', () => {
    expect(estimateBillAmount([], 10_000)).toBe(10_000);
  });
});

describe('confirmsAwaitingBill', () => {
  const waiting = { isAwaitingApproval: true, amount: 30_000 };

  it('is true when the amount changes', () => {
    expect(confirmsAwaitingBill(waiting, 28_000)).toBe(true);
  });

  it('is false for edits that keep the amount', () => {
    expect(confirmsAwaitingBill(waiting, 30_000)).toBe(false);
    expect(confirmsAwaitingBill(waiting, undefined)).toBe(false);
  });

  it('is false for rows that are not waiting', () => {
    expect(confirmsAwaitingBill({ amount: 30_000 }, 28_000)).toBe(false);
  });
});

describe('selectBillsAssignedTo', () => {
  const owner = new Types.ObjectId();
  const partner = new Types.ObjectId();
  const departed = new Types.ObjectId();
  const members = [
    { userId: owner, role: 'owner' as const },
    { userId: partner, role: 'member' as const },
  ];
  const bills = [{ userId: owner }, { userId: partner }, { userId: departed }];

  it('gives a member only the bills they set up', () => {
    expect(selectBillsAssignedTo(bills, partner.toString(), members)).toEqual([bills[1]]);
  });

  it('gives the owner their own bills and those of people who left', () => {
    expect(selectBillsAssignedTo(bills, owner.toString(), members)).toEqual([bills[0], bills[2]]);
  });
});
