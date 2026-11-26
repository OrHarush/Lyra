import { describe, expect, it } from 'vitest';

import { FixedExpenseDetailsSchema, UpdateFixedExpenseDetailsSchema } from '../fixedExpense';
import { CreateRecurringTemplateSchema } from '../recurringTemplate';
import { TransactionFormSchema } from '../transaction';

const validId = '507f1f77bcf86cd799439011';

describe('FixedExpenseDetailsSchema', () => {
  it('accepts a subscription with a known provider and an https link', () => {
    expect(
      FixedExpenseDetailsSchema.safeParse({
        kind: 'subscription',
        providerId: 'netflix',
        cancelUrl: 'https://www.netflix.com/cancelplan',
      }).success
    ).toBe(true);
  });

  it('accepts an empty link, which clears it', () => {
    expect(FixedExpenseDetailsSchema.safeParse({ kind: 'subscription', cancelUrl: '' }).success).toBe(
      true
    );
  });

  it.each(['javascript:alert(1)', 'ftp://example.com/cancel', 'not a url', 'mailto:a@b.co'])(
    'rejects %s as a cancellation link',
    cancelUrl => {
      expect(FixedExpenseDetailsSchema.safeParse({ cancelUrl }).success).toBe(false);
    }
  );

  it('rejects a provider that is not in the catalog', () => {
    expect(FixedExpenseDetailsSchema.safeParse({ providerId: 'made_up' }).success).toBe(false);
  });

  it('accepts a bill with a bill type', () => {
    expect(FixedExpenseDetailsSchema.safeParse({ kind: 'bill', billType: 'arnona' }).success).toBe(
      true
    );
  });

  it('requires a kind when updating details', () => {
    expect(UpdateFixedExpenseDetailsSchema.safeParse({ billType: 'water' }).success).toBe(false);
  });
});

describe('every two months', () => {
  it('is accepted as a template frequency', () => {
    expect(
      CreateRecurringTemplateSchema.safeParse({
        frequency: 'Bimonthly',
        dayOfMonth: 10,
        startDate: '2026-12-10',
        type: 'Expense',
        amount: 320,
        kind: 'bill',
        billType: 'electricity',
      }).success
    ).toBe(true);
  });

  it('is accepted as a form recurrence', () => {
    expect(
      TransactionFormSchema.safeParse({
        type: 'Expense',
        amount: 320,
        name: 'חשבון חשמל',
        recurrence: 'Bimonthly',
        startDate: '2026-12-10',
        account: validId,
        category: validId,
        kind: 'bill',
        billType: 'electricity',
      }).success
    ).toBe(true);
  });
});
