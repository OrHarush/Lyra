import { z } from 'zod';

import { objectIdSchema, positiveAmountSchema } from './common';

const isoDateSchema = z
  .string({ required_error: 'validation.required', invalid_type_error: 'validation.invalidDate' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'validation.invalidDate');

const instrumentSourceSchema = z.enum(['catalog', 'yahoo']);

const instrumentIdSchema = z
  .string({ required_error: 'validation.required', invalid_type_error: 'validation.required' })
  .trim()
  .min(1, 'validation.required')
  .max(30, 'validation.invalidSymbol')
  .regex(/^[A-Za-z0-9.^=-]+$/, 'validation.invalidSymbol');

const unitsSchema = z
  .number({ invalid_type_error: 'validation.invalidNumber' })
  .positive('validation.mustBePositive')
  .max(999_999_999, 'validation.amountOutOfRange');

const noteSchema = z.string().trim().max(200, 'validation.noteTooLong');

export const HistoryRange = z.enum(['3M', '1Y', 'ALL']);

export type HistoryRangeValue = z.infer<typeof HistoryRange>;

export const CreateInvestmentPurchaseSchema = z.object({
  source: instrumentSourceSchema,
  instrumentId: instrumentIdSchema,
  date: isoDateSchema,
  amount: positiveAmountSchema,
  units: unitsSchema.optional(),
  note: noteSchema.optional(),
});

export type CreateInvestmentPurchaseDTO = z.infer<typeof CreateInvestmentPurchaseSchema>;

export const UpdateInvestmentPurchaseSchema = z
  .object({
    source: instrumentSourceSchema.optional(),
    instrumentId: instrumentIdSchema.optional(),
    date: isoDateSchema.optional(),
    amount: positiveAmountSchema.optional(),
    units: unitsSchema.nullable().optional(),
    note: noteSchema.nullable().optional(),
  })
  .refine((changes) => Object.keys(changes).length > 0, { message: 'validation.noChanges' })
  .refine((changes) => (changes.source === undefined) === (changes.instrumentId === undefined), {
    message: 'validation.instrumentIncomplete',
  });

export type UpdateInvestmentPurchaseDTO = z.infer<typeof UpdateInvestmentPurchaseSchema>;

export const SearchInstrumentsQuerySchema = z.object({
  q: z.string().trim().max(50).default(''),
});

export const InvestmentHistoryQuerySchema = z.object({
  range: HistoryRange.default('ALL'),
  symbols: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((symbol) => symbol.trim().toUpperCase())
            .filter(Boolean)
        : undefined
    ),
});

export type InvestmentHistoryQuery = z.infer<typeof InvestmentHistoryQuerySchema>;

export const InvestmentPurchaseIdParamSchema = z.object({ id: objectIdSchema });
