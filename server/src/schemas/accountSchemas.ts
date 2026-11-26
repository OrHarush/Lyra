import { z } from 'zod';

export const GetBalanceForecastSchema = z
  .object({
    year: z.string().regex(/^\d{4}$/, 'year must be a 4-digit number'),
    month: z.string().regex(/^(1[0-2]|[1-9])$/, 'month must be between 1 and 12'),
  })
  // month is 0-indexed to match JS Date convention (0 = January)
  .transform(data => ({ year: parseInt(data.year, 10), month: parseInt(data.month, 10) - 1 }));

export type GetBalanceForecastQuery = z.infer<typeof GetBalanceForecastSchema>;
