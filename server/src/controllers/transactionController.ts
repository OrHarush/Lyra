import { CreateTransactionDTO, UpdateTransactionDTO } from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ExportTransactionsQuery } from '../schemas/transactionExportSchemas';
import {
  GetTransactionCalendarQuery,
  GetTransactionsQuery,
  GetTransactionSummaryQuery,
  ReviewTransactionsDTO,
} from '../schemas/transactionSchemas';
import * as exportTransactionsService from '../services/transactions/exportTransactionsService';
import * as quickChipsService from '../services/transactions/quickChipsService';
import * as transactionReviewService from '../services/transactions/transactionReviewService';
import * as transactionService from '../services/transactions/transactionService';

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const result = await transactionService.findAll(
    req.workspaceId,
    req.validatedQuery as GetTransactionsQuery
  );

  return ApiResponse.ok(res, {
    data: result.data,
    pagination: result.pagination,
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.getTransactionById(
    req.params.id as string,
    req.workspaceId
  );

  return ApiResponse.ok(res, transaction);
});

export const getTransactionSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await transactionService.getTransactionSummary(
    req.workspaceId,
    req.validatedQuery as GetTransactionSummaryQuery
  );

  return ApiResponse.ok(res, summary);
});

export const getTransactionCalendar = asyncHandler(async (req: Request, res: Response) => {
  const calendar = await transactionService.getTransactionCalendar(
    req.workspaceId,
    req.validatedQuery as GetTransactionCalendarQuery
  );

  return ApiResponse.ok(res, calendar);
});

export const getTransactionCount = asyncHandler(async (req: Request, res: Response) => {
  const counts = await transactionService.countAll(req.workspaceId);

  return ApiResponse.ok(res, counts);
});

export const getQuickChips = asyncHandler(async (req: Request, res: Response) => {
  const chips = await quickChipsService.getQuickChips(req.workspaceId);

  return ApiResponse.ok(res, chips);
});

export const getReviewCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await transactionReviewService.getReviewCount(req.userId);

  return ApiResponse.ok(res, { count });
});

export const getReviewList = asyncHandler(async (req: Request, res: Response) => {
  const data = await transactionReviewService.listNeedsReview(req.userId);

  return ApiResponse.ok(res, data);
});

export const reviewTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { items } = req.validatedBody as ReviewTransactionsDTO;
  const result = await transactionReviewService.reviewTransactions(req.userId, items);

  return ApiResponse.ok(res, result);
});

export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  const transaction = await transactionService.create(
    req.validatedBody as CreateTransactionDTO,
    req.userId,
    req.workspaceId
  );

  return ApiResponse.created(res, transaction);
});

export const updateTransaction = asyncHandler(async (req: Request, res: Response) => {
  const updatedTransaction = await transactionService.update(
    req.params.id as string,
    req.validatedBody as UpdateTransactionDTO,
    req.workspaceId,
    req.userId
  );

  return ApiResponse.ok(res, updatedTransaction);
});

export const deleteTransaction = asyncHandler(async (req: Request, res: Response) => {
  await transactionService.deleteTransaction(
    req.params.id as string,
    req.workspaceId,
    req.userId
  );

  return ApiResponse.deleted(res, 'Transaction deleted successfully');
});

export const exportTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as ExportTransactionsQuery;
  const buffer = await exportTransactionsService.exportByMonth(req.workspaceId, query);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="lyra-transactions-${query.monthLabel}.xlsx"`
  );
  res.setHeader('Content-Length', buffer.length);

  return res.status(200).send(buffer);
});
