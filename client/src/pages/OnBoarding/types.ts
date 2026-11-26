import type { TransactionFormValues } from '@lyra/shared';

export interface QuickAddPreset {
  type: 'Income' | 'Expense';
  name: string;
  amount?: number;
  category?: string;
  recurrence?: TransactionFormValues['recurrence'];
}
