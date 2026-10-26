import {
  CreateRecurringTemplateDTO,
  CreateTransactionDTO,
  MaterializeRecurringOccurrenceDTO,
  SplitRecurringTemplateDTO,
  TransactionFormValues,
  UpdateTransactionDTO,
} from '@lyra/shared';

import {
  ExpandedTransactionDto,
  SortableColumn,
  SortOrder,
  TransactionDto,
} from '@/types/Transaction';
import { PAYMENT_TYPE_LOCALE_KEY } from '@/utils/entities/paymentMethod';

const buildTransactionPayload = (data: TransactionFormValues) => {
  const base = {
    amount: Number(data.amount),
    date: data.date ? new Date(data.date).toISOString() : undefined,
    type: data.type,
    belongToPreviousMonth: data.belongToPreviousMonth,
    paymentMethodId: data.paymentMethod,
    note: data.note || undefined,
  };

  if (data.type === 'Expense' || data.type === 'Income') {
    return { ...base, name: data.name, categoryId: data.category, accountId: data.account };
  }

  return { ...base, fromAccountId: data.fromAccount, toAccountId: data.toAccount };
};

export const mapToCreatePayload = (data: TransactionFormValues): CreateTransactionDTO =>
  buildTransactionPayload(data);

export const mapToUpdatePayload = (data: TransactionFormValues): UpdateTransactionDTO =>
  buildTransactionPayload(data);

export const mapToTemplateChangesPayload = (
  data: TransactionFormValues,
  fromDate: string
): SplitRecurringTemplateDTO => {
  const base = {
    fromDate,
    amount: Number(data.amount),
    type: data.type,
    belongToPreviousMonth: data.belongToPreviousMonth,
    paymentMethodId: data.paymentMethod,
    note: data.note || undefined,
  };

  if (data.type === 'Expense' || data.type === 'Income') {
    return { ...base, name: data.name, categoryId: data.category, accountId: data.account };
  }

  return { ...base, fromAccountId: data.fromAccount, toAccountId: data.toAccount };
};

export const mapToMaterializePayload = (
  data: TransactionFormValues,
  occurrenceDate: string
): MaterializeRecurringOccurrenceDTO => {
  const base = {
    occurrenceDate,
    date: data.date ? new Date(data.date).toISOString() : undefined,
    amount: Number(data.amount),
    type: data.type,
    belongToPreviousMonth: data.belongToPreviousMonth,
    paymentMethodId: data.paymentMethod,
    note: data.note || undefined,
  };

  if (data.type === 'Expense' || data.type === 'Income') {
    return { ...base, name: data.name, categoryId: data.category, accountId: data.account };
  }

  return { ...base, fromAccountId: data.fromAccount, toAccountId: data.toAccount };
};

export const mapToRecurringTemplatePayload = (
  data: TransactionFormValues
): CreateRecurringTemplateDTO => {
  const base = {
    frequency: data.recurrence as 'Monthly' | 'Yearly',
    dayOfMonth: new Date(data.startDate!).getDate(),
    startDate: data.startDate!,
    endDate: data.endDate,
    type: data.type,
    amount: Number(data.amount),
    belongToPreviousMonth: data.belongToPreviousMonth,
    paymentMethodId: data.paymentMethod,
    note: data.note || undefined,
  };

  if (data.type === 'Expense' || data.type === 'Income') {
    return { ...base, name: data.name, categoryId: data.category, accountId: data.account };
  }

  return { ...base, fromAccountId: data.fromAccount, toAccountId: data.toAccount };
};

export const getTransactionDisplayDate = (tx: ExpandedTransactionDto) => tx.date ?? '';

export const isTransactionNeedsReview = (tx: TransactionDto): boolean =>
  (tx.source === 'google_pay' || tx.source === 'apple_pay') && !tx.reviewedAt;

const getSortValue = (tx: ExpandedTransactionDto, column: SortableColumn): string | number => {
  switch (column) {
    case 'name':
      return tx.name?.toLowerCase() ?? '';
    case 'amount':
      return tx.amount;
    case 'category':
      return tx.category?.name?.toLowerCase() ?? '';
    case 'account':
      return tx.account?.name?.toLowerCase() ?? '';
    case 'paymentMethod':
      return (
        tx.paymentMethod?.name ||
        PAYMENT_TYPE_LOCALE_KEY[tx.paymentMethod?.type] ||
        ''
      ).toLowerCase();
    case 'date':
      return tx.date ?? '';
  }
};

export const compareTransactions = (
  a: TransactionDto,
  b: TransactionDto,
  order: SortOrder,
  orderBy: SortableColumn
): number => {
  const aVal = getSortValue(a, orderBy);
  const bVal = getSortValue(b, orderBy);

  if (aVal < bVal) {
    return order === 'asc' ? -1 : 1;
  }

  if (aVal > bVal) {
    return order === 'asc' ? 1 : -1;
  }

  return 0;
};
