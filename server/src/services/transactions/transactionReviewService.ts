import { fromCents } from '@lyra/shared';
import { Types } from 'mongoose';

import { ApiError } from '../../errors/ApiError';
import { AUTOMATION_SOURCES } from '../../models/Transaction';
import * as categoryRepository from '../../repositories/categoryRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import { ReviewTransactionsDTO } from '../../schemas/transactionSchemas';
import * as merchantRulesService from '../merchantRulesService';
import { findPersonalWorkspaceIdForUser } from '../workspaceService';
import * as transactionService from './transactionService';

export const getReviewCount = (userId: string): Promise<number> =>
  transactionRepository.countNeedsReview(userId);

export const listNeedsReview = async (userId: string) => {
  const personalWorkspaceId = await findPersonalWorkspaceIdForUser(userId);

  const transactions = (await transactionRepository.findNeedsReview(userId)).map(transaction => ({
    ...transaction,
    amount: fromCents(transaction.amount),
  }));

  const categories = personalWorkspaceId
    ? await categoryRepository.findMany(personalWorkspaceId.toString())
    : [];

  return { transactions, categories };
};

export const reviewTransactions = async (
  userId: string,
  items: ReviewTransactionsDTO['items']
) => {
  const personalWorkspaceId = await findPersonalWorkspaceIdForUser(userId);

  if (!personalWorkspaceId) {
    throw ApiError.internal('No personal workspace found for user');
  }

  const workspaceId = personalWorkspaceId.toString();

  const categories = await categoryRepository.findMany(workspaceId);
  const validCategoryIds = new Set(categories.map(category => category._id.toString()));

  for (const item of items) {
    if (!validCategoryIds.has(item.categoryId)) {
      throw ApiError.badRequest('Invalid category for this workspace');
    }
  }

  for (const item of items) {
    const { transaction } = await transactionService.update(
      item.id,
      { name: item.name, categoryId: item.categoryId },
      workspaceId,
      userId
    );

    if (item.applyToFuture && transaction.sourceMerchant) {
      await merchantRulesService.upsertRule(userId, transaction.sourceMerchant, {
        alias: item.name,
        categoryId: item.categoryId,
      });
    }
  }

  const reviewCount = await transactionRepository.countNeedsReview(userId);

  return { reviewedCount: items.length, reviewCount };
};

const FALLBACK_REVIEW_NAME = 'Google Wallet';

// A leaked automation token must only ever reach this user's own unreviewed automation rows.
const findOwnPendingAutomationTransaction = async (
  userId: string,
  workspaceId: string,
  transactionId: string
) => {
  if (!Types.ObjectId.isValid(transactionId)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const transaction = await transactionRepository.findById(transactionId, workspaceId);
  const isOwnAutomation =
    transaction !== null &&
    transaction.userId.toString() === userId &&
    AUTOMATION_SOURCES.includes(transaction.source);

  if (!isOwnAutomation) {
    throw ApiError.notFound('Transaction not found');
  }

  return transaction;
};

export const categorizePendingAutomationTransaction = async (
  userId: string,
  transactionId: string,
  categoryId: string,
  applyToFuture: boolean
): Promise<{ changed: boolean }> => {
  const personalWorkspaceId = await findPersonalWorkspaceIdForUser(userId);

  if (!personalWorkspaceId) {
    throw ApiError.internal('No personal workspace found for user');
  }

  const transaction = await findOwnPendingAutomationTransaction(
    userId,
    personalWorkspaceId.toString(),
    transactionId
  );

  if (transaction.reviewedAt) {
    if (transaction.category?._id.toString() === categoryId) {
      return { changed: false };
    }

    throw ApiError.conflict('Transaction was already reviewed');
  }

  await reviewTransactions(userId, [
    {
      id: transactionId,
      name: transaction.name || transaction.sourceMerchant || FALLBACK_REVIEW_NAME,
      categoryId,
      applyToFuture,
    },
  ]);

  return { changed: true };
};
