import { Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as accountRepository from '../repositories/accountRepository';
import {
  ApproveDTO,
  ShortcutAndroidTransactionDTO,
  ShortcutTransactionDTO,
} from '../schemas/shortcutSchemas';
import * as shortcutService from '../services/shortcutService';
import * as automationTransactionService from '../services/transactions/automationTransactionService';
import * as transactionService from '../services/transactions/transactionService';
import { resolveWorkspaceForRequest } from '../services/workspaceService';

const toDisplayName = (category: shortcutService.ShortcutCategory) => {
  if (!category.workspaceName || category.isPersonal) {
    return category.name;
  }

  return `${category.name} (${category.workspaceName})`;
};

export const initShortcut = asyncHandler(async (req: Request, res: Response) => {
  const code = await shortcutService.createCode(req.userId);

  return ApiResponse.ok(res, { code });
});

export const approveShortcut = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.validatedBody as ApproveDTO;
  await shortcutService.approveCode(code, req.userId);

  return ApiResponse.ok(res, { approved: true });
});

export const getShortcutStatus = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.headers.authorization ?? '').slice('Shortcut '.length).trim();
  const { connectedAt } = await shortcutService.getShortcutConnection(token);

  return ApiResponse.ok(res, { connected: true, connectedAt });
});

export const getShortcutAndroidConnection = asyncHandler(
  async (req: Request, res: Response) => {
    const state = await shortcutService.getAndroidConnectionState(req.userId);

    return ApiResponse.ok(res, state);
  }
);

export const createShortcutAndroidToken = asyncHandler(async (req: Request, res: Response) => {
  const token = await shortcutService.issueAndroidToken(req.userId);

  return ApiResponse.created(res, { token });
});

export const downloadShortcutMacro = asyncHandler(async (req: Request, res: Response) => {
  const macro = await shortcutService.generateAndroidMacro(req.userId);

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${shortcutService.MACRO_FILENAME}"`
  );

  return res.send(macro);
});

export const revokeShortcut = asyncHandler(async (req: Request, res: Response) => {
  await shortcutService.revokeAllForUser(req.userId);

  return ApiResponse.ok(res, { revoked: true });
});

export const getShortcutToken = asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const token = await shortcutService.exchangeToken(code);

  if (token === null) {
    return res.status(202).json({ success: true, status: 'pending' });
  }

  return ApiResponse.ok(res, { token });
});

export const getShortcutCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await shortcutService.getShortcutCategories(req.userId);

  return ApiResponse.ok(res, {
    categories: categories.map(category => ({
      id: category.id,
      name: toDisplayName(category),
    })),
  });
});

export const createShortcutTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { amount, merchant, date, categoryId, note } = req.validatedBody as ShortcutTransactionDTO;

  const workspaceId = categoryId
    ? await shortcutService.resolveWorkspaceForCategory(req.userId, categoryId)
    : (await resolveWorkspaceForRequest(req.userId)).toString();

  const primary = await accountRepository.findPrimary(workspaceId);

  if (!primary) {
    throw ApiError.badRequest('No primary account found for this workspace');
  }

  const result = await transactionService.create(
    {
      type: 'Expense',
      amount,
      date,
      categoryId,
      note,
      name: merchant,
      accountId: primary._id.toString(),
    },
    req.userId,
    workspaceId
  );

  return ApiResponse.created(res, { id: result.transaction._id });
});

export const createShortcutAndroidTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { text, title, date } = req.validatedBody as ShortcutAndroidTransactionDTO;

    const amount = shortcutService.parseAndroidWalletAmount(text);

    const result = await automationTransactionService.createAutomationTransaction({
      userId: req.userId,
      source: 'google_pay',
      rawTitle: title,
      amount,
      date,
    });

    return ApiResponse.created(res, { id: result.transaction._id });
  }
);
