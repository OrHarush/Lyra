import { z } from 'zod';

export const GetTransactionsSchema = z
  .object({
    page: z.string().regex(/^\d+$/, 'page must be a number').optional().default('1'),
    limit: z.string().regex(/^\d+$/, 'limit must be a number').optional(),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    categoryIds: z.string().optional().transform(v => (v ? v.split(',').filter(Boolean) : undefined)),
    paymentMethodIds: z
      .string()
      .optional()
      .transform(v => (v ? v.split(',').filter(Boolean) : undefined)),
    accountIds: z
      .string()
      .optional()
      .transform(v => (v ? v.split(',').filter(Boolean) : undefined)),
    year: z
      .string()
      .regex(/^\d{4}$/, 'year must be a 4-digit number')
      .optional(),
    month: z
      .string()
      .regex(/^(1[0-2]|[1-9])$/, 'month must be between 1 and 12')
      .optional(),
    search: z.string().optional(),
  })
  .transform((data) => {
    const year = data.year ? parseInt(data.year, 10) : undefined;
    const month = data.month ? parseInt(data.month, 10) - 1 : undefined;
    const page = parseInt(data.page, 10);
    const limit = data.limit ? parseInt(data.limit, 10) : undefined;

    let from: Date | undefined;
    let to: Date | undefined;

    if (year !== undefined && month !== undefined) {
      from = new Date(Date.UTC(year, month, 1));
      to = new Date(Date.UTC(year, month + 2, 0, 23, 59, 59, 999));
    }

    return {
      page,
      limit,
      sort: (data.sort || 'desc') as 'asc' | 'desc',
      categoryIds: data.categoryIds,
      paymentMethodIds: data.paymentMethodIds,
      accountIds: data.accountIds,
      from,
      to,
      targetYear: year,
      // month is 0-indexed to match JS Date convention (0 = January)
      targetMonth: month,
      search: data.search,
    };
  });

export type GetTransactionsQuery = z.infer<typeof GetTransactionsSchema>;

// Partial version for internal callers (chat, MCP) that build options programmatically.
// Retains singular accountId for backward-compat with the summary endpoint internal call.
export type GetTransactionsOptions = Partial<GetTransactionsQuery> & {
  accountId?: string;
};

export const GetTransactionSummarySchema = z
  .object({
    year: z.string().regex(/^\d{4}$/, 'year must be a 4-digit number'),
    month: z
      .string()
      .regex(/^(1[0-2]|[1-9])$/, 'month must be between 1 and 12')
      .optional(),
    accountId: z.string().optional(),
    from: z.string().datetime({ offset: true }).optional(),
  })
  .transform((data) => ({
    year: parseInt(data.year, 10),
    month: data.month ? parseInt(data.month, 10) - 1 : undefined,
    accountId: data.accountId,
    from: data.from ? new Date(data.from) : undefined,
  }));

export type GetTransactionSummaryQuery = z.infer<typeof GetTransactionSummarySchema>;

const CALENDAR_MAX_RANGE_DAYS = 62;
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a YYYY-MM-DD date');

export const GetTransactionCalendarSchema = z
  .object({
    from: isoDay,
    to: isoDay,
    accountId: z.string().optional(),
  })
  .refine((data) => data.from <= data.to, { message: 'from must not be after to' })
  .refine(
    (data) =>
      (Date.parse(data.to) - Date.parse(data.from)) / 86_400_000 <= CALENDAR_MAX_RANGE_DAYS,
    { message: `range must not exceed ${CALENDAR_MAX_RANGE_DAYS} days` }
  );

export type GetTransactionCalendarQuery = z.infer<typeof GetTransactionCalendarSchema>;

export const ReviewTransactionsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().trim().min(1).max(50),
        categoryId: z.string().min(1),
        applyToFuture: z.boolean(),
      })
    )
    .min(1),
});

export type ReviewTransactionsDTO = z.infer<typeof ReviewTransactionsSchema>;
