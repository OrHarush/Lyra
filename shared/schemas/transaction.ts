import { z } from 'zod';

import { nameSchema, objectIdSchema, positiveAmountSchema } from './common';
import { FixedExpenseDetailsSchema, RECURRING_FREQUENCIES } from './fixedExpense';

const optionalObjectIdField = z.union([objectIdSchema, z.literal('')]).optional();

const BaseTransactionSchema = z.object({
  name: nameSchema(50).optional(),
  note: z.string().max(200, 'validation.noteTooLong').trim().optional(),
  type: z.enum(['Income', 'Expense', 'Transfer']),
  amount: positiveAmountSchema,
  frequency: z.enum(RECURRING_FREQUENCIES).optional(),
  belongToPreviousMonth: z.boolean().optional(),
  date: z.string().optional(),
  categoryId: objectIdSchema.optional(),
  accountId: objectIdSchema.optional(),
  fromAccountId: objectIdSchema.optional(),
  toAccountId: objectIdSchema.optional(),
  paymentMethodId: objectIdSchema.optional(),
  templateId: objectIdSchema.optional(),
});

export const CreateTransactionSchema = BaseTransactionSchema.superRefine((data, ctx) => {
  if (!data.date) {
    ctx.addIssue({ path: ['date'], code: 'custom', message: 'validation.dateRequired' });
  }

  if (data.type === 'Transfer') {
    if (!data.fromAccountId) {
      ctx.addIssue({
        path: ['fromAccountId'],
        code: 'custom',
        message: 'validation.accountRequired',
      });
    }
    if (!data.toAccountId) {
      ctx.addIssue({
        path: ['toAccountId'],
        code: 'custom',
        message: 'validation.accountRequired',
      });
    }
    if (data.fromAccountId && data.toAccountId && data.fromAccountId === data.toAccountId) {
      ctx.addIssue({
        path: ['toAccountId'],
        code: 'custom',
        message: 'validation.transferSameAccount',
      });
    }
    if (data.categoryId) {
      ctx.addIssue({
        path: ['categoryId'],
        code: 'custom',
        message: 'validation.transferRequiresAccounts',
      });
    }
  }

  if (data.type === 'Income' || data.type === 'Expense') {
    if (!data.name || data.name.trim() === '') {
      ctx.addIssue({ path: ['name'], code: 'custom', message: 'validation.required' });
    }
    if (!data.accountId) {
      ctx.addIssue({ path: ['accountId'], code: 'custom', message: 'validation.accountRequired' });
    }
    if (!data.categoryId) {
      ctx.addIssue({
        path: ['categoryId'],
        code: 'custom',
        message: 'validation.categoryRequired',
      });
    }
  }
});

export type CreateTransactionDTO = z.infer<typeof CreateTransactionSchema>;
export type TransactionType = CreateTransactionDTO['type'];

export const UpdateTransactionSchema = BaseTransactionSchema.partial().superRefine((data, ctx) => {
  if (data.fromAccountId && data.toAccountId && data.fromAccountId === data.toAccountId) {
    ctx.addIssue({
      path: ['toAccountId'],
      code: 'custom',
      message: 'validation.transferSameAccount',
    });
  }
});

export type UpdateTransactionDTO = z.infer<typeof UpdateTransactionSchema>;

const BaseTransactionFormSchema = FixedExpenseDetailsSchema.extend({
  name: nameSchema(50).optional(),
  amount: positiveAmountSchema,
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  recurrence: z.enum(['None', ...RECURRING_FREQUENCIES]),
  belongToPreviousMonth: z.boolean().optional(),
  type: z.enum(['Income', 'Expense', 'Transfer']),
  category: optionalObjectIdField,
  paymentMethod: optionalObjectIdField,
  account: optionalObjectIdField,
  fromAccount: optionalObjectIdField,
  toAccount: optionalObjectIdField,
  note: z.string().max(200, 'validation.noteTooLong').trim().optional(),
});

export const TransactionFormSchema = BaseTransactionFormSchema.superRefine((data, ctx) => {
  if (data.recurrence === 'None') {
    if (!data.date) {
      ctx.addIssue({ path: ['date'], code: 'custom', message: 'validation.dateRequired' });
    }
  } else {
    if (!data.startDate) {
      ctx.addIssue({
        path: ['startDate'],
        code: 'custom',
        message: 'validation.startDateRequired',
      });
    }
    if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
      ctx.addIssue({ path: ['endDate'], code: 'custom', message: 'validation.endDateAfterStart' });
    }
  }

  if (data.type === 'Transfer') {
    if (!data.fromAccount) {
      ctx.addIssue({
        path: ['fromAccount'],
        code: 'custom',
        message: 'validation.accountRequired',
      });
    }
    if (!data.toAccount) {
      ctx.addIssue({ path: ['toAccount'], code: 'custom', message: 'validation.accountRequired' });
    }
    if (data.fromAccount && data.toAccount && data.fromAccount === data.toAccount) {
      ctx.addIssue({
        path: ['toAccount'],
        code: 'custom',
        message: 'validation.transferSameAccount',
      });
    }
  }

  if (data.type === 'Income' || data.type === 'Expense') {
    if (!data.name || data.name.trim() === '') {
      ctx.addIssue({ path: ['name'], code: 'custom', message: 'validation.required' });
    }
    if (!data.account) {
      ctx.addIssue({ path: ['account'], code: 'custom', message: 'validation.accountRequired' });
    }
    if (!data.category) {
      ctx.addIssue({ path: ['category'], code: 'custom', message: 'validation.categoryRequired' });
    }
  }
});

export type TransactionFormValues = z.infer<typeof TransactionFormSchema>;
