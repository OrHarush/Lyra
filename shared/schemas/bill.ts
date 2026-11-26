import { z } from 'zod';

import { positiveAmountSchema } from './common';

export const ApproveBillSchema = z.object({
  amount: positiveAmountSchema,
});

export type ApproveBillDTO = z.infer<typeof ApproveBillSchema>;
