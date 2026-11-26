import { ApproveBillDTO } from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as billService from '../services/bills/billService';

export const getPendingBills = asyncHandler(async (req: Request, res: Response) => {
  const bills = await billService.getPendingBills(req.workspaceId);

  return ApiResponse.ok(res, bills);
});

export const approveBill = asyncHandler(async (req: Request, res: Response) => {
  const { amount } = req.validatedBody as ApproveBillDTO;
  const result = await billService.approveBill(req.params.id as string, amount, req.workspaceId);

  return ApiResponse.ok(res, result);
});
