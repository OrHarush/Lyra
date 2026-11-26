import type {
  BillType,
  FixedExpenseKind,
  RecurringFrequency,
  SubscriptionProviderId,
} from '@lyra/shared';

import { CategoryDto } from '@/types/Category';

export interface FixedExpenseDto {
  _id: string;
  name: string;
  kind: FixedExpenseKind;
  frequency: RecurringFrequency;
  amount: number;
  nextDate: string;
  monthlyAmount: number;
  yearlyAmount: number;
  providerId: SubscriptionProviderId | null;
  cancelUrl: string | null;
  billType: BillType | null;
  category: CategoryDto | null;
}

export interface FixedExpenseListDto {
  items: FixedExpenseDto[];
  totals: { monthly: number; yearly: number };
}
