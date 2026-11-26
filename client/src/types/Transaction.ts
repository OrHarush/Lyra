import type { RecurringFrequency, TransactionType } from '@lyra/shared';

import { AccountDto } from '@/types/Account';
import { CategoryDto } from '@/types/Category';
import { PaymentMethodDto } from '@/types/PaymentMethod';

export type TransactionSource = 'manual' | 'csv' | 'google_pay' | 'apple_pay';

export type TransactionTypeFilter = 'All' | 'Income' | 'Expense';

export interface TransactionTotalsDto {
  income: number;
  expenses: number;
  net: number;
}

export interface TransactionPageFormValues {
  searchValue: string;
  category: string;
  paymentMethod: string;
}

export interface TransactionDto {
  _id: string;
  name: string;
  note?: string;
  type: TransactionType;
  amount: number;
  date?: string;
  frequency?: RecurringFrequency;
  templateId?: string;
  isVirtual?: boolean;
  isAwaitingApproval?: boolean;
  belongToPreviousMonth?: boolean;
  category: CategoryDto;
  paymentMethod?: PaymentMethodDto;
  account?: AccountDto;
  fromAccount?: AccountDto;
  toAccount?: AccountDto;
  source: TransactionSource;
  reviewedAt?: string | null;
  sourceMerchant?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewTransactionDto {
  _id: string;
  name: string;
  amount: number;
  date?: string;
  source: TransactionSource;
  sourceMerchant?: string | null;
  reviewedAt?: string | null;
  category?: CategoryDto;
  account?: AccountDto;
  paymentMethod?: PaymentMethodDto;
}

export interface TransactionSummaryDto {
  monthlyIncome: number;
  monthlyExpenses: number;
}

export interface ExpandedTransactionDto extends TransactionDto {
  originalId?: string;
}

export interface TransactionMutationResult {
  transaction: TransactionDto;
  accounts: AccountDto[];
}

export type SortOrder = 'asc' | 'desc';

export type SortableColumn = 'name' | 'amount' | 'category' | 'account' | 'paymentMethod' | 'date';
