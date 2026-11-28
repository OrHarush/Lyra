import { describe, expect, it } from 'vitest';

import { planIngestion } from '../../src/notificationIngestion/ingestionPlan';

const CARD = { cardName: 'American Express Hever', last4: '1135' };
const TEXT = { text: '₪44.80 with American Express Hever ••1135' };

describe('planIngestion', () => {
  it('creates an ILS purchase as an expense on the notification card', () => {
    const plan = planIngestion(
      { kind: 'purchase', merchant: 'a m p m', amount: 44.8, currency: 'ILS', ...CARD },
      TEXT
    );

    expect(plan).toEqual({
      outcome: 'created',
      transaction: {
        rawTitle: 'a m p m',
        merchantKeys: ['a m p m', 'ampm'],
        amount: 44.8,
        type: 'Expense',
        note: undefined,
        paymentLast4: '1135',
      },
      rawText: null,
    });
  });

  it('queues a foreign-currency purchase at amount 0 with the original amount in the note', () => {
    const plan = planIngestion(
      { kind: 'purchase', merchant: 'Amazon', amount: 12, currency: 'USD', ...CARD },
      { text: '$12.00 with American Express Hever ••1135' }
    );

    expect(plan.outcome).toBe('created');
    expect(plan.transaction).toMatchObject({
      amount: 0,
      type: 'Expense',
      note: 'USD 12.00 (unconverted)',
    });
  });

  it('records a refund as income', () => {
    const plan = planIngestion(
      { kind: 'refund', merchant: 'ampm', amount: 44.8, currency: 'ILS', ...CARD },
      TEXT
    );

    expect(plan.transaction).toMatchObject({ amount: 44.8, type: 'Income', note: 'Refund' });
  });

  it('queues a parse failure with the merchant only, amount 0, and keeps the raw text', () => {
    const plan = planIngestion(
      { kind: 'parse_failed', merchant: 'ampm' },
      { text: 'You paid ₪44.80', bigText: 'at ampm' }
    );

    expect(plan).toEqual({
      outcome: 'parse_failed',
      transaction: {
        rawTitle: 'ampm',
        merchantKeys: ['ampm'],
        amount: 0,
        type: 'Expense',
        note: 'Wallet: You paid ₪44.80\nat ampm',
      },
      rawText: 'You paid ₪44.80\nat ampm',
    });
  });

  it('names a parse failure with a blank merchant after Google Wallet', () => {
    const plan = planIngestion({ kind: 'parse_failed', merchant: '' }, { text: '₪?' });

    expect(plan.transaction?.rawTitle).toBe('Google Wallet');
  });

  it('creates nothing for ignored notifications', () => {
    expect(planIngestion({ kind: 'ignored' }, { text: 'Pass added' })).toEqual({
      outcome: 'ignored',
      transaction: null,
      rawText: null,
    });
  });
});
