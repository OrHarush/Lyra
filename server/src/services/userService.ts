import { toCents } from '@lyra/shared';
import mongoose, { Types } from 'mongoose';

import {
  DEFAULT_ACCOUNT,
  DEFAULT_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from '../constants/defaultEntities';
import { IAccount } from '../models/Account';
import { ICategory } from '../models/Category';
import { DeletionReason, IDeletionFeedback } from '../models/DeletionFeedback';
import { IPaymentMethod } from '../models/PaymentMethod';
import { IUser } from '../models/User';
import * as accountRepository from '../repositories/accountRepository';
import * as analyticsEventRepository from '../repositories/analyticsEventRepository';
import { insertMany as createCategories } from '../repositories/categoryRepository';
import * as dailyActivityRepository from '../repositories/dailyActivityRepository';
import { deleteMany as deleteDebugSnapshots } from '../repositories/debugSnapshotRepository';
import * as deletionFeedbackRepository from '../repositories/deletionFeedbackRepository';
import * as feedbackRepository from '../repositories/feedbackRepository';
import * as investmentPurchaseRepository from '../repositories/investmentPurchaseRepository';
import * as paymentMethodRepository from '../repositories/paymentMethodRepository';
import { countByUser } from '../repositories/transactionRepository';
import * as userActivityRepository from '../repositories/userActivityRepository';
import {
  deleteUserById,
  findById,
  updateAnalyticsConsent as updateAnalyticsConsentRepo,
  updateOnboarding,
  updatePreferences as updatePreferencesRepo,
} from '../repositories/userRepository';
import * as workspaceMemberRepository from '../repositories/workspaceMemberRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import { isExcludedEmail } from '../utils/excludedEmails';
import * as analyticsService from './analyticsService';
import * as emailService from './emailService';
import {
  deleteWorkspaceCompletely,
  leaveSharedWorkspaceTx,
} from './workspaceLifecycleService';
import { getActiveWorkspaceIdOrThrow } from './workspaceService';

export interface DeletionFeedbackInput {
  reason?: DeletionReason | null;
  comment?: string | null;
  locale: 'he' | 'en';
}

export const getCurrentUserById = async (userId: string) => findById(userId);

export const updatePreferences = async (userId: string, displayCurrency: string) =>
  updatePreferencesRepo(userId, displayCurrency);

export const updateAnalyticsConsent = async (
  userId: string,
  analyticsConsent: 'accepted' | 'rejected'
) => updateAnalyticsConsentRepo(userId, analyticsConsent);

export const createDefaultEntitiesForNewUser = async (
  userId: string,
  workspaceId: Types.ObjectId,
  session?: mongoose.ClientSession
) => {
  const categoriesToCreate: Omit<ICategory, '_id'>[] = DEFAULT_CATEGORIES.map(dto => ({
    key: dto.key,
    name: dto.name,
    type: dto.type,
    color: dto.color ?? '#9ca3af',
    icon: dto.icon ?? '',
    userId: new Types.ObjectId(userId),
    workspaceId,
  }));

  const paymentMethodsToCreate: Omit<IPaymentMethod, '_id'>[] = DEFAULT_PAYMENT_METHODS.map(
    dto => ({
      name: dto.name,
      type: dto.type,
      billingDay: dto.billingDay ?? null,
      lastFourDigits: dto.lastFourDigits,
      isPrimary: dto.isPrimary ?? false,
      key: dto.key,
      userId: new Types.ObjectId(userId),
      workspaceId,
    })
  );

  const defaultBalanceCents = toCents(DEFAULT_ACCOUNT.balance ?? 0);

  const defaultAccount: Omit<IAccount, '_id'> = {
    name: DEFAULT_ACCOUNT.name,
    balance: defaultBalanceCents,
    checkpointBalance: defaultBalanceCents,
    checkpointDate: new Date(),
    institution: DEFAULT_ACCOUNT.institution,
    accountNumber: DEFAULT_ACCOUNT.accountNumber,
    icon: DEFAULT_ACCOUNT.icon,
    currency: DEFAULT_ACCOUNT.currency ?? 'ILS',
    isPrimary: true,
    key: DEFAULT_ACCOUNT.key,
    userId: new Types.ObjectId(userId),
    workspaceId,
  };

  await Promise.all([
    createCategories(categoriesToCreate, session),
    paymentMethodRepository.insertMany(paymentMethodsToCreate, session),
    accountRepository.insert(defaultAccount, session),
  ]);
};

export const completeOnboarding = async (userId: string, billingDay?: number) => {
  if (billingDay !== undefined) {
    // Bridge: payment methods is workspace-scoped (Step 3).
    const workspaceId = (await getActiveWorkspaceIdOrThrow(userId)).toString();
    const creditCard = await paymentMethodRepository.findByType(workspaceId, 'Credit Card');

    if (creditCard) {
      await paymentMethodRepository.updateById(
        creditCard._id.toString(),
        { billingDay },
        workspaceId
      );
    }
  }

  const result = await updateOnboarding(userId);

  void analyticsService.track(userId, 'onboarding_completed').catch(err =>
    console.error('Failed to track onboarding_completed:', err)
  );

  return result;
};

const MS_PER_DAY = 86_400_000;

const buildDeletionSnapshot = (
  user: IUser,
  transactionCount: number,
  feedback?: DeletionFeedbackInput
): Partial<IDeletionFeedback> => {
  const createdAt = user.createdAt ?? new Date();
  const daysSinceSignup = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / MS_PER_DAY));
  const trimmedComment = feedback?.comment?.trim();

  return {
    reason: feedback?.reason ?? null,
    comment: trimmedComment ? trimmedComment : null,
    transactionCount,
    daysSinceSignup,
    hadCompletedOnboarding: !!user.hasCompletedOnboarding,
    locale: feedback?.locale ?? 'he',
  };
};

const recordDeletionFeedback = async (
  user: IUser,
  feedback?: DeletionFeedbackInput
): Promise<Partial<IDeletionFeedback> | null> => {
  try {
    const transactionCount = await countByUser(user._id);
    const snapshot = buildDeletionSnapshot(user, transactionCount, feedback);
    await deletionFeedbackRepository.insert(snapshot);
    return snapshot;
  } catch (err) {
    console.error('Failed to record deletion feedback:', err);
    return null;
  }
};

const notifyDeletionAlert = (user: IUser, snapshot: Partial<IDeletionFeedback> | null) => {
  if (isExcludedEmail(user.email)) {
    return;
  }

  void emailService
    .sendDeletionAlert({
      userEmail: user.email,
      userName: user.name,
      reason: snapshot?.reason ?? null,
      comment: snapshot?.comment ?? null,
      transactionCount: snapshot?.transactionCount ?? 0,
      daysSinceSignup: snapshot?.daysSinceSignup ?? 0,
      hadCompletedOnboarding: snapshot?.hadCompletedOnboarding ?? false,
      locale: snapshot?.locale ?? 'he',
    })
    .catch(err => console.error('Failed to send deletion alert:', err));
};

export const deleteUserCompletely = async (userId: string, feedback?: DeletionFeedbackInput) => {
  const user = await findById(userId);

  if (!user) {
    return { success: true };
  }

  const deletionSnapshot = await recordDeletionFeedback(user, feedback);

  const analyticsSnapshot = await analyticsService.captureUserSnapshot(userId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const memberships = await workspaceMemberRepository.findByUser(userId);

    for (const membership of memberships) {
      const workspace = await workspaceRepository.findById(membership.workspaceId);

      if (!workspace) {
        continue;
      }

      if (workspace.type === 'personal') {
        await deleteWorkspaceCompletely(workspace._id, session);
      } else {
        await leaveSharedWorkspaceTx(userId, membership.workspaceId, session);
      }
    }

    await investmentPurchaseRepository.deleteAllByUser(userId, session);
    await deleteDebugSnapshots({ userId }, session);
    await userActivityRepository.anonymizeByUser(userId, session);
    await analyticsEventRepository.anonymizeByUserName(user.name, session);
    await dailyActivityRepository.anonymizeByUser(userId, session);
    await feedbackRepository.anonymizeByUser(userId, session);
    await deleteUserById(userId, session);

    await session.commitTransaction();
    await session.endSession();

    if (analyticsSnapshot) {
      void analyticsService
        .trackWithSnapshot('user_deleted', analyticsSnapshot)
        .catch(err => console.error('Failed to track user_deleted:', err));
    }

    notifyDeletionAlert(user, deletionSnapshot);

    return { success: true };
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw err;
  }
};
