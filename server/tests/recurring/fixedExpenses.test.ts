import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { buildFixedExpenses, findNextOccurrence } from '../../src/services/recurring/buildFixedExpenses';
import { normalizeFixedExpenseDetails } from '../../src/services/recurring/fixedExpenseDetails';
import { isOccurrenceMonth } from '../../src/services/recurring/occurrence';
import { buildVirtualTransactions } from '../../src/services/transactions/buildVirtualTransactions';
import { IRecurringTemplatePopulated } from '../../src/types/RecurringTemplate';
import { category, day, monthlyExpenseTemplate } from '../balance/fixtures';

const TODAY = day('2026-11-26');
const month = (isoMonth: string) => day(`${isoMonth}-01`);

const template = (overrides: Partial<IRecurringTemplatePopulated> = {}) =>
  monthlyExpenseTemplate(100, 10, '2026-01-10', overrides);

const dayjsMonth = async (isoMonth: string) => {
  const { default: dayjs } = await import('dayjs');
  const { default: utc } = await import('dayjs/plugin/utc');
  dayjs.extend(utc);

  return dayjs.utc(month(isoMonth));
};

describe('isOccurrenceMonth', () => {
  it.each([
    ['2026-01', true],
    ['2026-02', false],
    ['2026-03', true],
    ['2026-12', false],
    ['2027-01', true],
    ['2025-11', false],
  ])('every two months from January: %s → %s', async (isoMonth, expected) => {
    expect(isOccurrenceMonth('Bimonthly', day('2026-01-10'), await dayjsMonth(isoMonth))).toBe(
      expected
    );
  });

  it('carries the two-month rhythm across a year end', async () => {
    const start = day('2026-11-15');

    expect(isOccurrenceMonth('Bimonthly', start, await dayjsMonth('2027-01'))).toBe(true);
    expect(isOccurrenceMonth('Bimonthly', start, await dayjsMonth('2027-02'))).toBe(false);
  });

  it('keeps monthly and yearly as before', async () => {
    const start = day('2026-03-01');

    expect(isOccurrenceMonth('Monthly', start, await dayjsMonth('2026-08'))).toBe(true);
    expect(isOccurrenceMonth('Yearly', start, await dayjsMonth('2027-03'))).toBe(true);
    expect(isOccurrenceMonth('Yearly', start, await dayjsMonth('2027-04'))).toBe(false);
  });
});

describe('future recurring rows every two months', () => {
  it('appear only in their months, on a clamped day', () => {
    const virtual = buildVirtualTransactions(
      [template({ frequency: 'Bimonthly', dayOfMonth: 31, startDate: day('2026-12-31') })],
      [],
      month('2026-12'),
      day('2027-05-01')
    );

    expect(virtual.map(tx => tx.date?.toISOString().slice(0, 10))).toEqual([
      '2026-12-31',
      '2027-02-28',
      '2027-04-30',
    ]);
    expect(virtual.every(tx => tx.frequency === 'Bimonthly')).toBe(true);
  });
});

describe('findNextOccurrence', () => {
  it('is later this month when the day has not come yet', () => {
    expect(findNextOccurrence(template({ dayOfMonth: 28 }), TODAY)).toEqual(day('2026-11-28'));
  });

  it('is today when it falls today', () => {
    expect(findNextOccurrence(template({ dayOfMonth: 26 }), TODAY)).toEqual(day('2026-11-26'));
  });

  it('moves to next month once this month’s day passed', () => {
    expect(findNextOccurrence(template({ dayOfMonth: 10 }), TODAY)).toEqual(day('2026-12-10'));
  });

  it('skips the off month of a two-month bill', () => {
    const bill = template({ frequency: 'Bimonthly', startDate: day('2026-11-05'), dayOfMonth: 5 });

    expect(findNextOccurrence(bill, TODAY)).toEqual(day('2027-01-05'));
  });

  it('waits for a start date in the future', () => {
    expect(findNextOccurrence(template({ startDate: day('2027-02-03'), dayOfMonth: 3 }), TODAY)).toEqual(
      day('2027-02-03')
    );
  });

  it('has none once the end date passed', () => {
    expect(findNextOccurrence(template({ endDate: day('2026-11-20') }), TODAY)).toBeNull();
  });
});

describe('buildFixedExpenses', () => {
  it('totals per month and per year by frequency', () => {
    const { items, totals } = buildFixedExpenses(
      [
        template({ amount: 5490, dayOfMonth: 27, kind: 'subscription' }),
        template({ amount: 32000, frequency: 'Bimonthly', startDate: day('2026-12-10'), kind: 'bill' }),
        template({ amount: 120000, frequency: 'Yearly', startDate: day('2027-03-01'), dayOfMonth: 1 }),
      ],
      TODAY
    );

    expect(items.map(item => [item.kind, item.monthlyAmount, item.yearlyAmount])).toEqual([
      ['subscription', 5490, 65880],
      ['bill', 16000, 192000],
      [null, 10000, 120000],
    ]);
    expect(totals).toEqual({ monthly: 31490, yearly: 377880 });
  });

  it('lists the soonest first', () => {
    const { items } = buildFixedExpenses(
      [template({ name: 'later', dayOfMonth: 15 }), template({ name: 'sooner', dayOfMonth: 28 })],
      TODAY
    );

    expect(items.map(item => item.template.name)).toEqual(['sooner', 'later']);
  });

  it('leaves out income, savings and expenses that already ended', () => {
    const { items } = buildFixedExpenses(
      [
        template({ type: 'Income', category: category('Income') as never }),
        template({ category: category('Savings') as never }),
        template({ endDate: day('2026-10-31') }),
        template({ _id: new Types.ObjectId() as unknown as string, name: 'kept' }),
      ],
      TODAY
    );

    expect(items.map(item => item.template.name)).toEqual(['kept']);
  });
});

describe('normalizeFixedExpenseDetails', () => {
  it('keeps only a subscription’s provider and link', () => {
    expect(
      normalizeFixedExpenseDetails('Expense', {
        kind: 'subscription',
        providerId: 'netflix',
        cancelUrl: 'https://example.com/cancel',
        billType: 'water',
      })
    ).toEqual({
      kind: 'subscription',
      providerId: 'netflix',
      cancelUrl: 'https://example.com/cancel',
      billType: undefined,
    });
  });

  it('drops the link when a subscription becomes a bill', () => {
    expect(
      normalizeFixedExpenseDetails('Expense', {
        kind: 'bill',
        providerId: 'netflix',
        cancelUrl: 'https://example.com/cancel',
        billType: 'electricity',
      })
    ).toEqual({ kind: 'bill', providerId: undefined, cancelUrl: undefined, billType: 'electricity' });
  });

  it('gives income no kind at all', () => {
    expect(normalizeFixedExpenseDetails('Income', { kind: 'bill', billType: 'water' }).kind).toBeUndefined();
  });

  it('treats an empty link as no link', () => {
    expect(
      normalizeFixedExpenseDetails('Expense', { kind: 'subscription', cancelUrl: '' }).cancelUrl
    ).toBeUndefined();
  });
});
