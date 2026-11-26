import { z } from 'zod';

import { SUBSCRIPTION_PROVIDER_IDS } from '../types/subscriptionProviders';

export const RECURRING_FREQUENCIES = ['Monthly', 'Bimonthly', 'Yearly'] as const;
export type RecurringFrequency = (typeof RECURRING_FREQUENCIES)[number];

export const FIXED_EXPENSE_KINDS = ['regular', 'subscription', 'bill'] as const;
export type FixedExpenseKind = (typeof FIXED_EXPENSE_KINDS)[number];

export const BILL_TYPES = ['electricity', 'water', 'arnona', 'gas', 'other'] as const;
export type BillType = (typeof BILL_TYPES)[number];

// Partners in a shared household open this link, so only web links are accepted.
export const cancelUrlSchema = z
  .string()
  .trim()
  .max(500, 'validation.urlTooLong')
  .url('validation.invalidUrl')
  .refine(url => /^https?:\/\//i.test(url), 'validation.invalidUrl');

const optionalCancelUrl = z.union([cancelUrlSchema, z.literal('')]).optional();

export const FixedExpenseDetailsSchema = z.object({
  kind: z.enum(FIXED_EXPENSE_KINDS).optional(),
  providerId: z.enum(SUBSCRIPTION_PROVIDER_IDS).optional(),
  cancelUrl: optionalCancelUrl,
  billType: z.enum(BILL_TYPES).optional(),
});

export type FixedExpenseDetailsDTO = z.infer<typeof FixedExpenseDetailsSchema>;

export const UpdateFixedExpenseDetailsSchema = FixedExpenseDetailsSchema.required({ kind: true });

export type UpdateFixedExpenseDetailsDTO = z.infer<typeof UpdateFixedExpenseDetailsSchema>;
