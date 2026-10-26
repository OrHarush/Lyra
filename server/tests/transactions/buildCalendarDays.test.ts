import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { IAccount } from '../../src/models/Account';
import { IPaymentMethod } from '../../src/models/PaymentMethod';
import {
  buildCalendarDays,
  flattenEvents,
} from '../../src/services/transactions/buildCalendarDays';
import { ITransactionPopulated } from '../../src/types/Transaction';

const ACCOUNT_ID = new Types.ObjectId().toString();
const OTHER_ACCOUNT_ID = new Types.ObjectId().toString();
dayjs.extend(utc);

const OCT_FROM = dayjs.utc('2026-10-01');
const OCT_TO = dayjs.utc('2026-10-31');
const NOV_FROM = dayjs.utc('2026-11-01');
const NOV_TO = dayjs.utc('2026-11-30');

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

const eventDays = (days: ReturnType<typeof buildCalendarDays>) =>
  days.filter(day => day.events.length > 0);

describe('buildCalendarDays', () => {
  it('puts a card purchase made before the billing day on this month’s bill', () => {
    const card = creditCard(10);
    const days = buildCalendarDays(
      [
        tx({ paymentMethod: card, date: new Date('2026-10-03T00:00:00Z'), amount: 5000 }),
        tx({ paymentMethod: card, date: new Date('2026-09-20T00:00:00Z'), amount: 2500 }),
      ],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)).toHaveLength(1);
    expect(eventDays(days)[0].date).toBe('2026-10-10');
    expect(eventDays(days)[0].events[0]).toMatchObject({
      kind: 'cardBill',
      amount: 75,
      transactionCount: 2,
      lastFourDigits: '1234',
    });
  });

  it('moves a card purchase made on or after the billing day to next month', () => {
    const days = buildCalendarDays(
      [tx({ paymentMethod: creditCard(10), date: new Date('2026-10-10T00:00:00Z') })],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)).toEqual([]);
  });

  it('clamps a billing day of 31 to the last day of a 30-day month', () => {
    const days = buildCalendarDays(
      [tx({ paymentMethod: creditCard(31), date: new Date('2026-10-31T00:00:00Z') })],
      NOV_FROM,
      NOV_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)[0].date).toBe('2026-11-30');
  });

  it('subtracts card refunds from the bill', () => {
    const card = creditCard(10);
    const days = buildCalendarDays(
      [
        tx({ paymentMethod: card, date: new Date('2026-10-01T00:00:00Z'), amount: 10000 }),
        tx({
          paymentMethod: card,
          type: 'Income',
          date: new Date('2026-10-02T00:00:00Z'),
          amount: 3000,
        }),
      ],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)[0].events[0].amount).toBe(70);
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
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)[0]).toMatchObject({
      date: '2026-10-10',
      events: [{ kind: 'income', name: 'Salary', amount: 14200, isVirtual: true }],
    });
  });

  it('excludes other accounts and transfers', () => {
    const days = buildCalendarDays(
      [tx({ account: account(OTHER_ACCOUNT_ID) }), tx({ type: 'Transfer' })],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)).toEqual([]);
  });

  it('orders income before bills before expenses within a day', () => {
    const date = new Date('2026-10-10T00:00:00Z');
    const days = buildCalendarDays(
      [
        tx({ date, name: 'Rent' }),
        tx({ date: new Date('2026-10-01T00:00:00Z'), paymentMethod: creditCard(10) }),
        tx({ date, type: 'Income', name: 'Salary' }),
      ],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(eventDays(days)[0].events.map(event => event.kind)).toEqual([
      'income',
      'cardBill',
      'expense',
    ]);
  });

  it('returns every day of the month', () => {
    expect(buildCalendarDays([], OCT_FROM, OCT_TO, ACCOUNT_ID)).toHaveLength(31);
  });

  describe('daily balances', () => {
    const now = new Date('2026-10-15T12:00:00Z');
    const context = { currentBalance: 100000, now };
    const balanceOn = (days: ReturnType<typeof buildCalendarDays>, date: string) =>
      days.find(day => day.date === date);

    it('walks back over real transactions for past days', () => {
      const days = buildCalendarDays(
        [tx({ type: 'Income', amount: 20000, date: new Date('2026-10-12T00:00:00Z') })],
        OCT_FROM,
        OCT_TO,
        ACCOUNT_ID,
        context
      );

      expect(balanceOn(days, '2026-10-11')).toMatchObject({ balance: 800, isProjected: false });
      expect(balanceOn(days, '2026-10-12')?.balance).toBe(1000);
    });

    it('projects future days including virtual recurring items and card bills', () => {
      const days = buildCalendarDays(
        [
          tx({ amount: 30000, date: new Date('2026-10-20T00:00:00Z'), isVirtual: true }),
          tx({
            paymentMethod: creditCard(25),
            amount: 5000,
            date: new Date('2026-10-14T00:00:00Z'),
          }),
        ],
        OCT_FROM,
        OCT_TO,
        ACCOUNT_ID,
        context
      );

      expect(balanceOn(days, '2026-10-19')).toMatchObject({ balance: 1000, isProjected: true });
      expect(balanceOn(days, '2026-10-20')?.balance).toBe(700);
      expect(balanceOn(days, '2026-10-25')?.balance).toBe(650);
    });

    it('ignores virtual items when walking back', () => {
      const days = buildCalendarDays(
        [tx({ amount: 30000, date: new Date('2026-10-12T00:00:00Z'), isVirtual: true })],
        OCT_FROM,
        OCT_TO,
        ACCOUNT_ID,
        context
      );

      expect(balanceOn(days, '2026-10-11')?.balance).toBe(1000);
    });

    it('counts transfers into the balance even though they are not events', () => {
      const days = buildCalendarDays(
        [
          tx({
            type: 'Transfer',
            account: undefined,
            fromAccount: account(ACCOUNT_ID),
            toAccount: account(OTHER_ACCOUNT_ID),
            amount: 10000,
            date: new Date('2026-10-18T00:00:00Z'),
          }),
        ],
        OCT_FROM,
        OCT_TO,
        ACCOUNT_ID,
        context
      );

      expect(balanceOn(days, '2026-10-18')).toMatchObject({ balance: 900, events: [] });
    });

    it('leaves balance empty without a balance context', () => {
      expect(buildCalendarDays([], OCT_FROM, OCT_TO, ACCOUNT_ID)[0].balance).toBeNull();
    });
  });

  it('covers neighbouring-month days when the range spans them', () => {
    const days = buildCalendarDays(
      [tx({ paymentMethod: creditCard(2), date: new Date('2026-10-20T00:00:00Z'), amount: 4000 })],
      dayjs.utc('2026-09-27'),
      dayjs.utc('2026-11-07'),
      ACCOUNT_ID
    );

    expect(days).toHaveLength(42);
    expect(days[0].date).toBe('2026-09-27');
    expect(eventDays(days)).toMatchObject([{ date: '2026-11-02', events: [{ kind: 'cardBill' }] }]);
  });

  it('flattens events with their dates in day order', () => {
    const days = buildCalendarDays(
      [
        tx({ type: 'Income', name: 'Salary', date: new Date('2026-10-10T00:00:00Z') }),
        tx({ name: 'Rent', date: new Date('2026-10-01T00:00:00Z') }),
      ],
      OCT_FROM,
      OCT_TO,
      ACCOUNT_ID
    );

    expect(flattenEvents(days).map(({ date, event }) => [date, event.name])).toEqual([
      ['2026-10-01', 'Rent'],
      ['2026-10-10', 'Salary'],
    ]);
  });
});
