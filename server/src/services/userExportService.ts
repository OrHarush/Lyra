import { Types } from 'mongoose';

import { ApiError } from '../errors/ApiError';
import { IUser } from '../models/User';
import * as accountRepository from '../repositories/accountRepository';
import * as budgetRepository from '../repositories/budgetRepository';
import * as categoryRepository from '../repositories/categoryRepository';
import * as goalRepository from '../repositories/goalRepository';
import * as investmentPurchaseRepository from '../repositories/investmentPurchaseRepository';
import * as paymentMethodRepository from '../repositories/paymentMethodRepository';
import * as recurringTemplateRepository from '../repositories/recurringTemplateRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import * as userRepository from '../repositories/userRepository';
import * as workspaceMemberRepository from '../repositories/workspaceMemberRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import {
  ANONYMOUS_SENTINEL,
  resolveCreatorNamesForWorkspace,
} from './attributionService';
import { getActiveWorkspaceIdOrThrow } from './workspaceService';

const EXPORT_VERSION = '1.0' as const;

export interface ExportedUser {
  email: string;
  name: string;
  displayCurrency: string;
  createdAt: Date | undefined;
  acceptedTermsAt: Date | null;
  acceptedPrivacyAt: Date | null;
  consentVersion: string | undefined;
  consentLocale: string | undefined;
  hasCompletedOnboarding: boolean;
  analyticsConsent: IUser['analyticsConsent'];
}

export interface UserExport {
  exportedAt: string;
  exportVersion: typeof EXPORT_VERSION;
  user: ExportedUser;
  accounts: unknown[];
  categories: unknown[];
  paymentMethods: unknown[];
  transactions: unknown[];
  recurringTemplates: unknown[];
  budgets: unknown[];
  goals: unknown[];
  investmentPurchases: unknown[];
}

const pickExportedUserFields = (user: IUser): ExportedUser => ({
  email: user.email,
  name: user.name,
  displayCurrency: user.displayCurrency,
  createdAt: user.createdAt,
  acceptedTermsAt: user.acceptedTermsAt,
  acceptedPrivacyAt: user.acceptedPrivacyAt,
  consentVersion: user.consentVersion,
  consentLocale: user.consentLocale,
  hasCompletedOnboarding: user.hasCompletedOnboarding,
  analyticsConsent: user.analyticsConsent,
});

const stripOpsFields = (doc: object): Record<string, unknown> => {
  const { userId: _userId, __v: _v, ...rest } = doc as Record<string, unknown>;

  return rest;
};

// TODO: if any single user exceeds ~50,000 transactions, switch to streaming
// (e.g. JSONStream.stringify + res.write) instead of buffering the whole export.
export const buildExport = async (userId: string): Promise<UserExport> => {
  const workspaceId = (await getActiveWorkspaceIdOrThrow(userId)).toString();

  const [
    user,
    accounts,
    categories,
    paymentMethods,
    transactions,
    recurringTemplates,
    budgets,
    goals,
    investmentPurchases,
  ] = await Promise.all([
    userRepository.findById(userId),
    accountRepository.findMany(workspaceId),
    categoryRepository.findMany(workspaceId),
    paymentMethodRepository.findMany(workspaceId),
    transactionRepository.findAllByWorkspace(workspaceId),
    recurringTemplateRepository.findMany(workspaceId),
    budgetRepository.findAllByWorkspace(workspaceId),
    goalRepository.findMany(workspaceId),
    investmentPurchaseRepository.findAllByUser(userId),
  ]);

  if (!user) {
    throw ApiError.notFound('User not found.');
  }

  const userObject = user.toObject() as IUser;

  return {
    exportedAt: new Date().toISOString(),
    exportVersion: EXPORT_VERSION,
    user: pickExportedUserFields(userObject),
    accounts: accounts.map(stripOpsFields),
    categories: categories.map(stripOpsFields),
    paymentMethods: paymentMethods.map(stripOpsFields),
    transactions: transactions.map(stripOpsFields),
    recurringTemplates: recurringTemplates.map(stripOpsFields),
    budgets: budgets.map(stripOpsFields),
    goals: goals.map(stripOpsFields),
    investmentPurchases: investmentPurchases.map(stripOpsFields),
  };
};

export interface WorkspaceExport {
  exportedAt: string;
  exportVersion: typeof EXPORT_VERSION;
  workspace: {
    _id: string;
    name: string;
    type: 'personal' | 'shared';
    currency: string;
    icon?: string;
    color?: string;
  };
  accounts: unknown[];
  categories: unknown[];
  paymentMethods: unknown[];
  transactions: unknown[];
  recurringTemplates: unknown[];
  budgets: unknown[];
  goals: unknown[];
}

const collectCreatorIds = (docs: Array<Record<string, unknown>>): string[] => {
  const ids: string[] = [];

  for (const doc of docs) {
    const raw = doc.userId;

    if (raw instanceof Types.ObjectId) {
      ids.push(raw.toString());
    } else if (typeof raw === 'string') {
      ids.push(raw);
    }
  }

  return ids;
};

const withResolvedCreator = (
  doc: Record<string, unknown>,
  creatorNames: Map<string, string>
): Record<string, unknown> => {
  const rawUserId = doc.userId;
  const id =
    rawUserId instanceof Types.ObjectId
      ? rawUserId.toString()
      : typeof rawUserId === 'string'
        ? rawUserId
        : null;

  const { userId: _userId, __v: _v, ...rest } = doc;

  return {
    ...rest,
    createdBy: id ? (creatorNames.get(id) ?? ANONYMOUS_SENTINEL) : ANONYMOUS_SENTINEL,
  };
};

const assertWorkspaceMembership = async (
  workspaceId: string,
  callerUserId: string
): Promise<void> => {
  const member = await workspaceMemberRepository.findOne(workspaceId, callerUserId);

  if (!member) {
    throw ApiError.forbidden('NOT_MEMBER');
  }
};

export interface WorkspaceExportBundle {
  data: WorkspaceExport;
  workspaceName: string;
}

export const buildWorkspaceExport = async (
  workspaceId: string,
  callerUserId: string
): Promise<WorkspaceExportBundle> => {
  if (!Types.ObjectId.isValid(workspaceId)) {
    throw ApiError.badRequest('Invalid workspace ID');
  }

  await assertWorkspaceMembership(workspaceId, callerUserId);

  const workspace = await workspaceRepository.findById(workspaceId);

  if (!workspace) {
    throw ApiError.notFound('WORKSPACE_NOT_FOUND');
  }

  const [
    accounts,
    categories,
    paymentMethods,
    transactions,
    recurringTemplates,
    budgets,
    goals,
  ] = await Promise.all([
    accountRepository.findMany(workspaceId),
    categoryRepository.findMany(workspaceId),
    paymentMethodRepository.findMany(workspaceId),
    transactionRepository.findAllByWorkspace(workspaceId),
    recurringTemplateRepository.findMany(workspaceId),
    budgetRepository.findAllByWorkspace(workspaceId),
    goalRepository.findMany(workspaceId),
  ]);

  const allDocs: Array<Record<string, unknown>> = [
    ...accounts,
    ...categories,
    ...paymentMethods,
    ...transactions,
    ...recurringTemplates,
    ...budgets,
    ...goals,
  ].map(doc => doc as unknown as Record<string, unknown>);

  const creatorIds = collectCreatorIds(allDocs);
  const creatorNames = await resolveCreatorNamesForWorkspace(creatorIds, workspaceId);

  const data: WorkspaceExport = {
    exportedAt: new Date().toISOString(),
    exportVersion: EXPORT_VERSION,
    workspace: {
      _id: workspace._id.toString(),
      name: workspace.name,
      type: workspace.type,
      currency: workspace.currency,
      icon: workspace.icon,
      color: workspace.color,
    },
    accounts: accounts.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    categories: categories.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    paymentMethods: paymentMethods.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    transactions: transactions.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    recurringTemplates: recurringTemplates.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    budgets: budgets.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
    goals: goals.map((d: object) => withResolvedCreator(d as Record<string, unknown>, creatorNames)),
  };

  return { data, workspaceName: workspace.name };
};
