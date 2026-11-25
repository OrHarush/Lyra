import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { IBudget } from '../../src/models/Budget';
import { ICategory } from '../../src/models/Category';
import { IPaymentMethod } from '../../src/models/PaymentMethod';
import {
  buildCategoryTrends,
  computeTrendDelta,
  getTrendsFetchWindow,
} from '../../src/services/transactions/buildCategoryTrends';
import { ITransactionPopulated } from '../../src/types/Transaction';

const FOOD_ID = new Types.ObjectId();
const FUN_ID = new Types.ObjectId();

const category = (id: Types.ObjectId, name: string, type: ICategory['type'] = 'Expense') =>
  ({ _id: id, name, type, color: '#fff', icon: 'x' }) as unknown as ICategory;

const food = category(FOOD_ID, 'Food');

const card = (billingDay: number) =>
  ({ type: 'Credit Card', billingDay }) as unknown as IPaymentMethod;

const tx = (overrides: Partial<ITransactionPopulated>): ITransactionPopulated =>
  ({
    _id: new Types.ObjectId().toString(),
    type: 'Expense',
    amount: 100_00,
    date: new Date('2026-10-05T00:00:00Z'),
    category: food,
    ...overrides,
  }) as ITransactionPopulated;

const budget = (month: number, limit: number, categoryId = FOOD_ID) =>
  ({ categoryId, year: 2026, month, limit }) as unknown as IBudget;

const NOW = new Date('2026-11-25T10:00:00Z');
const base = { budgets: [], endYear: 2026, endMonth: 10, months: 3, now: NOW };

describe('computeTrendDelta', () => {
  const full = { basis: 'fullMonth' as const, dayOfMonth: 25 };

  it('returns a rounded percent', () => {
    expect(computeTrendDelta({ current: 150_00, previous: 100_00, ...full })).toMatchObject({
      kind: 'percent',
      percent: 50,
    });
  });

  it('returns none when the amount did not change', () => {
    expect(computeTrendDelta({ current: 3000_00, previous: 3000_00, ...full }).kind).toBe('none');
  });

  it('returns none when the rounded percent is zero', () => {
    expect(computeTrendDelta({ current: 1000_04, previous: 1000_00, ...full }).kind).toBe('none');
  });

  it('returns new without dividing by zero', () => {
    expect(computeTrendDelta({ current: 50_00, previous: 0, ...full }).kind).toBe('new');
  });

  it('returns none when both months are empty', () => {
    expect(computeTrendDelta({ current: 0, previous: 0, ...full }).kind).toBe('none');
  });

  it('falls back to the absolute difference under the minimum base', () => {
    expect(computeTrendDelta({ current: 90_00, previous: 20_00, ...full })).toMatchObject({
      kind: 'smallBase',
      absolute: 70_00,
    });
  });

  it('clamps huge percentages', () => {
    expect(computeTrendDelta({ current: 900_000_00, previous: 100_00, ...full }).percent).toBe(999);
  });

  it('shows a negative percent for a decrease', () => {
    expect(computeTrendDelta({ current: 50_00 * 4, previous: 400_00 * 2, ...full }).percent).toBe(
      -75
    );
  });

  it('hides month-to-date deltas before day 7', () => {
    const input = { current: 500_00, previous: 100_00, basis: 'monthToDate' as const };

    expect(computeTrendDelta({ ...input, dayOfMonth: 6 }).kind).toBe('none');
    expect(computeTrendDelta({ ...input, dayOfMonth: 7 }).kind).toBe('percent');
  });
});

describe('buildCategoryTrends', () => {
  it('buckets by month and zero-fills empty months', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [
        tx({ date: new Date('2026-09-10T00:00:00Z'), amount: 200_00 }),
        tx({ date: new Date('2026-10-10T00:00:00Z'), amount: 300_00 }),
      ],
    });

    expect(result.periods).toEqual(['2026-09', '2026-10', '2026-11']);
    expect(result.categories[0].months.map(m => m.total)).toEqual([200_00, 300_00, 0]);
  });

  it('assigns card purchases before the billing day to the previous month', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [
        tx({
          date: new Date('2026-11-03T00:00:00Z'),
          amount: 400_00,
          paymentMethod: card(10),
        }),
      ],
    });

    const months = result.categories[0].months;

    expect(months.find(m => m.period === '2026-10')?.total).toBe(400_00);
    expect(months.find(m => m.period === '2026-11')?.total).toBe(0);
  });

  it('honours belongToPreviousMonth', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [
        tx({ date: new Date('2026-11-02T00:00:00Z'), amount: 80_00, belongToPreviousMonth: true }),
      ],
    });

    expect(result.categories[0].months.find(m => m.period === '2026-10')?.total).toBe(80_00);
  });

  it('excludes transfers, income and non-expense categories', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [
        tx({ type: 'Transfer' }),
        tx({ type: 'Income' }),
        tx({ category: category(FUN_ID, 'Savings', 'Savings') }),
        tx({ category: undefined }),
      ],
    });

    expect(result.categories).toEqual([]);
  });

  it('scopes to an account when given', () => {
    const accountId = new Types.ObjectId();
    const other = new Types.ObjectId();
    const result = buildCategoryTrends({
      ...base,
      accountId: accountId.toString(),
      transactions: [
        tx({ account: { _id: accountId } as never, amount: 100_00 }),
        tx({ account: { _id: other } as never, amount: 900_00 }),
      ],
    });

    expect(result.categories[0].months[1].total).toBe(100_00);
  });

  it('compares the current month to the same point last month', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [
        tx({ date: new Date('2026-10-05T00:00:00Z'), amount: 200_00 }),
        tx({ date: new Date('2026-10-28T00:00:00Z'), amount: 800_00 }),
        tx({ date: new Date('2026-11-05T00:00:00Z'), amount: 300_00 }),
      ],
    });

    const november = result.categories[0].months[2];

    expect(november.total).toBe(300_00);
    expect(november.delta).toMatchObject({ kind: 'percent', percent: 50, basis: 'monthToDate' });
  });

  it('hides the current month delta before day 7', () => {
    const result = buildCategoryTrends({
      ...base,
      now: new Date('2026-11-04T10:00:00Z'),
      transactions: [
        tx({ date: new Date('2026-10-02T00:00:00Z'), amount: 100_00 }),
        tx({ date: new Date('2026-11-02T00:00:00Z'), amount: 500_00 }),
      ],
    });

    expect(result.categories[0].months[2].delta.kind).toBe('none');
  });

  it('marks a category with no spend last month as new', () => {
    const result = buildCategoryTrends({
      ...base,
      transactions: [tx({ date: new Date('2026-10-05T00:00:00Z'), amount: 300_00 })],
    });

    expect(result.categories[0].months[1].delta.kind).toBe('new');
  });

  it('leaves budget null for months without one instead of carrying it forward', () => {
    const result = buildCategoryTrends({
      ...base,
      budgets: [budget(9, 500_00)],
      transactions: [tx({ date: new Date('2026-10-05T00:00:00Z') })],
    });

    expect(result.categories[0].months.map(m => m.budget)).toEqual([null, 500_00, null]);
  });

  it('sorts categories by end-month spend', () => {
    const fun = category(FUN_ID, 'Fun');
    const result = buildCategoryTrends({
      ...base,
      now: new Date('2026-12-20T00:00:00Z'),
      transactions: [
        tx({ date: new Date('2026-11-05T00:00:00Z'), amount: 100_00 }),
        tx({ date: new Date('2026-11-05T00:00:00Z'), amount: 700_00, category: fun }),
      ],
    });

    expect(result.categories.map(c => c.name)).toEqual(['Fun', 'Food']);
  });
});

describe('getTrendsFetchWindow', () => {
  it('pads one month before the first period and one after the end', () => {
    const { from, to } = getTrendsFetchWindow(2026, 10, 12);

    expect(from.toISOString()).toBe('2025-11-01T00:00:00.000Z');
    expect(to.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});
