import { describe, expect, it } from 'vitest';

import { sortAndPaginate, sumIncomeAndExpenses } from '../../src/utils/transaction';

describe('sumIncomeAndExpenses', () => {
  it('sums income and expenses and ignores transfers', () => {
    const totals = sumIncomeAndExpenses([
      { type: 'Income', amount: 1000 },
      { type: 'Expense', amount: 250 },
      { type: 'Expense', amount: 50 },
      { type: 'Transfer', amount: 9999 },
      { type: 'Transfer', amount: 9999 },
    ]);

    expect(totals).toEqual({ income: 1000, expenses: 300 });
  });

  it('returns zeros for a month with only transfers', () => {
    expect(sumIncomeAndExpenses([{ type: 'Transfer', amount: 500 }])).toEqual({
      income: 0,
      expenses: 0,
    });
  });
});

describe('sortAndPaginate', () => {
  it('breaks date ties by createdAt, newest first', () => {
    const sameDay = '2026-11-20T00:00:00.000Z';
    const result = sortAndPaginate(
      [
        { _id: 'older', date: sameDay, createdAt: '2026-11-20T08:00:00.000Z' },
        { _id: 'newer', date: sameDay, createdAt: '2026-11-20T09:00:00.000Z' },
        { _id: 'earlier-day', date: '2026-11-19T00:00:00.000Z', createdAt: '2026-11-21T00:00:00.000Z' },
      ],
      'desc'
    );

    expect(result.data.map(tx => tx._id)).toEqual(['newer', 'older', 'earlier-day']);
  });
});
