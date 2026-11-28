import { Types } from 'mongoose';

import { ApiError } from '../../errors/ApiError';
import Category from '../../models/Category';
import { TransactionSource } from '../../models/Transaction';
import * as accountRepository from '../../repositories/accountRepository';
import * as paymentMethodRepository from '../../repositories/paymentMethodRepository';
import * as merchantRulesService from '../merchantRulesService';
import { findPersonalWorkspaceIdForUser } from '../workspaceService';
import * as transactionService from './transactionService';

const TRANSACTION_NAME_MAX_LENGTH = 50;

interface AutomationTransactionInput {
  userId: string;
  source: TransactionSource;
  rawTitle: string;
  amount: number;
  date?: string;
  type?: 'Expense' | 'Income';
  note?: string;
  paymentLast4?: string;
  merchantKeys?: string[];
}

const findExistingCategoryId = async (
  categoryId: Types.ObjectId | null | undefined,
  workspaceId: string
): Promise<string | undefined> => {
  if (!categoryId) {
    return undefined;
  }

  const category = await Category.findOne({
    _id: categoryId,
    workspaceId: new Types.ObjectId(workspaceId),
  });

  return category ? category._id.toString() : undefined;
};

const findFirstRule = async (userId: string, merchantKeys: string[]) => {
  for (const key of merchantKeys) {
    const rule = await merchantRulesService.lookupRule(userId, key);

    if (rule) {
      return rule;
    }
  }

  return null;
};

const findPaymentMethod = async (workspaceId: string, paymentLast4?: string) => {
  const byCard = paymentLast4
    ? await paymentMethodRepository.findByLastFour(workspaceId, paymentLast4)
    : null;

  return byCard ?? paymentMethodRepository.findPrimary(workspaceId);
};

export const createAutomationTransaction = async ({
  userId,
  source,
  rawTitle,
  amount,
  date,
  type = 'Expense',
  note,
  paymentLast4,
  merchantKeys = [rawTitle],
}: AutomationTransactionInput) => {
  const personalWorkspaceId = await findPersonalWorkspaceIdForUser(userId);

  if (!personalWorkspaceId) {
    throw ApiError.internal('No personal workspace found for user');
  }

  const workspaceId = personalWorkspaceId.toString();

  const primaryAccount = await accountRepository.findPrimary(workspaceId);

  if (!primaryAccount) {
    throw ApiError.badRequest('No primary account found for this workspace');
  }

  const paymentMethod = await findPaymentMethod(workspaceId, paymentLast4);

  const rule = await findFirstRule(userId, merchantKeys);
  const name = (rule?.alias ?? rawTitle).slice(0, TRANSACTION_NAME_MAX_LENGTH);
  // Merchant rules hold expense categories; an Income refund would fail the category type check.
  const ruleCategoryId = type === 'Expense' ? rule?.categoryId : undefined;
  const categoryId = await findExistingCategoryId(ruleCategoryId, workspaceId);

  return transactionService.create(
    {
      type,
      amount,
      date: date ?? new Date().toISOString(),
      name,
      note,
      accountId: primaryAccount._id.toString(),
      paymentMethodId: paymentMethod?._id.toString(),
      categoryId,
    },
    userId,
    workspaceId,
    source,
    rawTitle
  );
};
