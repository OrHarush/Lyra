import { Types } from 'mongoose';

import { IAccount } from '../../src/models/Account';
import { IPaymentMethod } from '../../src/models/PaymentMethod';
import { IRecurringTemplatePopulated } from '../../src/types/RecurringTemplate';
import { ITransactionPopulated } from '../../src/types/Transaction';

export const ACCOUNT_ID = new Types.ObjectId().toString();
export const OTHER_ACCOUNT_ID = new Types.ObjectId().toString();

export const account = (id: string) => ({ _id: new Types.ObjectId(id) }) as unknown as IAccount;

export const category = (type: 'Income' | 'Expense' | 'Savings') =>
  ({ _id: new Types.ObjectId(), name: type, type }) as unknown as ITransactionPopulated['category'];

export const creditCard = (billingDay: number) =>
  ({
    _id: new Types.ObjectId(),
    name: 'Visa',
    type: 'Credit Card',
    billingDay,
  }) as unknown as IPaymentMethod;

export const day = (isoDay: string) => new Date(`${isoDay}T00:00:00.000Z`);

const base = (amount: number, isoDay: string) => ({
  _id: new Types.ObjectId().toString(),
  name: 'Item',
  amount: amount * 100,
  date: day(isoDay),
  userId: new Types.ObjectId(),
  source: 'manual' as const,
});

export const expense = (
  amount: number,
  isoDay: string,
  overrides: Partial<ITransactionPopulated> = {}
): ITransactionPopulated => ({
  ...base(amount, isoDay),
  type: 'Expense',
  account: account(ACCOUNT_ID),
  category: category('Expense'),
  ...overrides,
});

export const income = (
  amount: number,
  isoDay: string,
  overrides: Partial<ITransactionPopulated> = {}
): ITransactionPopulated => ({
  ...base(amount, isoDay),
  type: 'Income',
  account: account(ACCOUNT_ID),
  category: category('Income'),
  ...overrides,
});

export const transfer = (
  amount: number,
  isoDay: string,
  fromAccountId: string,
  toAccountId: string
): ITransactionPopulated => ({
  ...base(amount, isoDay),
  type: 'Transfer',
  fromAccount: account(fromAccountId),
  toAccount: account(toAccountId),
});

export const monthlyExpenseTemplate = (
  amount: number,
  dayOfMonth: number,
  startDay: string,
  overrides: Partial<IRecurringTemplatePopulated> = {}
): IRecurringTemplatePopulated => ({
  _id: new Types.ObjectId() as unknown as string,
  name: 'Recurring',
  type: 'Expense',
  amount: amount * 100,
  frequency: 'Monthly',
  dayOfMonth,
  startDate: day(startDay),
  account: account(ACCOUNT_ID),
  category: category('Expense') as IRecurringTemplatePopulated['category'],
  userId: new Types.ObjectId(),
  isActive: true,
  lastGeneratedDate: null,
  ...overrides,
});
