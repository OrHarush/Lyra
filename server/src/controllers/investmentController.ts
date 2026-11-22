import {
  CreateInvestmentPurchaseDTO,
  InvestmentHistoryQuery,
  UpdateInvestmentPurchaseDTO,
} from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import { investmentService } from '../services/investments/investmentService';

export const searchInstruments = asyncHandler(async (req: Request, res: Response) => {
  const { q } = req.validatedQuery as { q: string };

  return ApiResponse.ok(res, await investmentService.searchInstruments(q));
});

export const getPurchases = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.ok(res, await investmentService.listPurchases(req.userId))
);

export const createPurchase = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.created(
    res,
    await investmentService.createPurchase(
      req.userId,
      req.validatedBody as CreateInvestmentPurchaseDTO
    )
  )
);

export const updatePurchase = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.ok(
    res,
    await investmentService.updatePurchase(
      req.userId,
      req.params.id as string,
      req.validatedBody as UpdateInvestmentPurchaseDTO
    )
  )
);

export const deletePurchase = asyncHandler(async (req: Request, res: Response) => {
  await investmentService.deletePurchase(req.userId, req.params.id as string);

  return ApiResponse.deleted(res);
});

export const getPurchaseTrends = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.ok(res, await investmentService.getPurchaseTrends(req.userId))
);

export const getSummary = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.ok(res, await investmentService.getSummary(req.userId))
);

export const getHistory = asyncHandler(async (req: Request, res: Response) =>
  ApiResponse.ok(
    res,
    await investmentService.getHistory(req.userId, req.validatedQuery as InvestmentHistoryQuery)
  )
);
