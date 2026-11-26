import { CreateAccountDTO, UpdateAccountDTO } from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import { GetBalanceForecastQuery } from '../schemas/accountSchemas';
import * as accountService from '../services/accountService';
import { getBalanceForecast } from '../services/balanceService';

export const getAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await accountService.findAll(req.workspaceId);

  return ApiResponse.ok(res, accounts);
});

export const getAccountById = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.getAccountById(req.params.id as string, req.workspaceId);

  return ApiResponse.ok(res, account);
});

export const getAccountForecast = asyncHandler(async (req: Request, res: Response) => {
  const forecast = await getBalanceForecast(
    req.workspaceId,
    req.params.id as string,
    req.validatedQuery as GetBalanceForecastQuery
  );

  return ApiResponse.ok(res, forecast);
});

export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.create(
    req.validatedBody as CreateAccountDTO,
    req.userId,
    req.workspaceId
  );

  return ApiResponse.created(res, account);
});

export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const updated = await accountService.update(
    req.params.id as string,
    req.validatedBody as UpdateAccountDTO,
    req.workspaceId
  );

  return ApiResponse.ok(res, updated);
});

export const setPrimaryAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await accountService.setPrimary(req.params.id as string, req.workspaceId);

  return ApiResponse.ok(res, account);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await accountService.deleteAccount(
    req.params.id as string,
    req.workspaceId,
    req.body?.replacementId as string | undefined
  );

  return ApiResponse.deleted(res, 'Account deleted');
});

export const getLinkedTransactionsCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await accountService.getLinkedTransactionsCount(
    req.workspaceId,
    req.params.id as string
  );

  return ApiResponse.ok(res, { count });
});
