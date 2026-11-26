import {
  CreateRecurringTemplateDTO,
  CreateTransactionDTO,
  MaterializeRecurringOccurrenceDTO,
  RecurringFrequency,
  SplitRecurringTemplateDTO,
  TransactionFormValues,
  UpdateTransactionDTO,
} from '@lyra/shared';

import {
  ExpandedTransactionDto,
  SortableColumn,
  SortOrder,
  TransactionDto,
  TransactionTotalsDto,
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
    frequency: data.recurrence as RecurringFrequency,
    dayOfMonth: new Date(data.startDate!).getDate(),
    startDate: data.startDate!,
    endDate: data.endDate,
    type: data.type,
    amount: Number(data.amount),
    belongToPreviousMonth: data.belongToPreviousMonth,
    paymentMethodId: data.paymentMethod,
    note: data.note || undefined,
  };

  if (data.type === 'Expense') {
    return {
      ...base,
      name: data.name,
      categoryId: data.category,
      accountId: data.account,
      ...mapFixedExpenseDetails(data),
    };
  }

  if (data.type === 'Income') {
    return { ...base, name: data.name, categoryId: data.category, accountId: data.account };
  }

  return { ...base, fromAccountId: data.fromAccount, toAccountId: data.toAccount };
};

const mapFixedExpenseDetails = ({ kind, providerId, cancelUrl, billType }: TransactionFormValues) => ({
  kind: kind ?? 'regular',
  providerId: kind === 'subscription' ? providerId : undefined,
  cancelUrl: kind === 'subscription' ? cancelUrl || undefined : undefined,
  billType: kind === 'bill' ? billType : undefined,
});

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

export const getTransactionAmountColor = (tx: TransactionDto): 'error.main' | 'success.main' => {
  if (tx.type === 'Transfer') {
    return tx.account?._id === tx.fromAccount?._id ? 'error.main' : 'success.main';
  }

  return tx.type === 'Expense' ? 'error.main' : 'success.main';
};

export interface TransactionDayGroup {
  date: string;
  transactions: ExpandedTransactionDto[];
}

export const groupTransactionsByDay = (
  transactions: ExpandedTransactionDto[]
): TransactionDayGroup[] => {
  const groups = new Map<string, ExpandedTransactionDto[]>();

  transactions.forEach(tx => {
    const day = getTransactionDisplayDate(tx).split('T')[0];

    groups.set(day, [...(groups.get(day) ?? []), tx]);
  });

  return [...groups].map(([date, dayTransactions]) => ({ date, transactions: dayTransactions }));
};

export const sumLoadedTransactions = (transactions: TransactionDto[]): TransactionTotalsDto =>
  transactions.reduce(
    (totals, tx) => {
      if (tx.type === 'Income') {
        totals.income += tx.amount;
        totals.net += tx.amount;
      }

      if (tx.type === 'Expense') {
        totals.expenses += tx.amount;
        totals.net -= tx.amount;
      }

      return totals;
    },
    { income: 0, expenses: 0, net: 0 }
  );
