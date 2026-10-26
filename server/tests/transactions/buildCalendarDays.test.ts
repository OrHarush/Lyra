import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { IAccount } from '../../src/models/Account';
import { IPaymentMethod } from '../../src/models/PaymentMethod';
import { buildCalendarDays } from '../../src/services/transactions/buildCalendarDays';
import { ITransactionPopulated } from '../../src/types/Transaction';

const ACCOUNT_ID = new Types.ObjectId().toString();
const OTHER_ACCOUNT_ID = new Types.ObjectId().toString();
const OCTOBER = 9;

const account = (id: string) => ({ _id: new Types.ObjectId(id) }) as unknown as IAccount;

const creditCard = (billingDay: number) =>
  ({
    _id: new Types.ObjectId(),
    name: 'Visa',
    type: 'Credit Card',
    billingDay,
    lastFourDigits: '1234',
  }) as unknown as IPaymentMethod;

const tx = (overrides: Partial<ITransactionPopulated>): ITransactionPopulated =>
  ({
    _id: new Types.ObjectId().toString(),
    name: 'Item',
    type: 'Expense',
    amount: 10000,
    date: new Date('2026-10-05T00:00:00Z'),
    account: account(ACCOUNT_ID),
    userId: new Types.ObjectId(),
    source: 'manual',
    ...overrides,
  }) as ITransactionPopulated;

describe('buildCalendarDays', () => {
  it('puts a card purchase made before the billing day on this month’s bill', () => {
    const card = creditCard(10);
    const days = buildCalendarDays(
      [
        tx({ paymentMethod: card, date: new Date('2026-10-03T00:00:00Z'), amount: 5000 }),
        tx({ paymentMethod: card, date: new Date('2026-09-20T00:00:00Z'), amount: 2500 }),
      ],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2026-10-10');
    expect(days[0].events[0]).toMatchObject({
      kind: 'cardBill',
      amount: 75,
      transactionCount: 2,
      lastFourDigits: '1234',
    });
  });

  it('moves a card purchase made on or after the billing day to next month', () => {
    const days = buildCalendarDays(
      [tx({ paymentMethod: creditCard(10), date: new Date('2026-10-10T00:00:00Z') })],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days).toEqual([]);
  });

  it('clamps a billing day of 31 to the last day of a 30-day month', () => {
    const days = buildCalendarDays(
      [tx({ paymentMethod: creditCard(31), date: new Date('2026-10-31T00:00:00Z') })],
      2026,
      10,
      ACCOUNT_ID
    );

    expect(days[0].date).toBe('2026-11-30');
  });

  it('subtracts card refunds from the bill', () => {
    const card = creditCard(10);
    const days = buildCalendarDays(
      [
        tx({ paymentMethod: card, date: new Date('2026-10-01T00:00:00Z'), amount: 10000 }),
        tx({ paymentMethod: card, type: 'Income', date: new Date('2026-10-02T00:00:00Z'), amount: 3000 }),
      ],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days[0].events[0].amount).toBe(70);
  });

  it('includes a virtual recurring salary on its own date', () => {
    const days = buildCalendarDays(
      [
        tx({
          type: 'Income',
          name: 'Salary',
          amount: 1420000,
          date: new Date('2026-10-10T00:00:00Z'),
          isVirtual: true,
        }),
      ],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days[0]).toMatchObject({
      date: '2026-10-10',
      events: [{ kind: 'income', name: 'Salary', amount: 14200, isVirtual: true }],
    });
  });

  it('excludes other accounts and transfers', () => {
    const days = buildCalendarDays(
      [tx({ account: account(OTHER_ACCOUNT_ID) }), tx({ type: 'Transfer' })],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days).toEqual([]);
  });

  it('orders income before bills before expenses within a day', () => {
    const date = new Date('2026-10-10T00:00:00Z');
    const days = buildCalendarDays(
      [
        tx({ date, name: 'Rent' }),
        tx({ date: new Date('2026-10-01T00:00:00Z'), paymentMethod: creditCard(10) }),
        tx({ date, type: 'Income', name: 'Salary' }),
      ],
      2026,
      OCTOBER,
      ACCOUNT_ID
    );

    expect(days[0].events.map(event => event.kind)).toEqual(['income', 'cardBill', 'expense']);
  });
});
