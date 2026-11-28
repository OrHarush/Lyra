import { IngestNotificationDTO, SetPendingCategoryDTO } from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ingestNotification, setPendingCategory } from './notificationIngestionService';

export const ingestWalletNotification = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestNotification(req.userId, req.validatedBody as IngestNotificationDTO);

  return ApiResponse.ok(res, result);
});

export const setPendingTransactionCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await setPendingCategory(
    req.userId,
    req.params.transactionId as string,
    req.validatedBody as SetPendingCategoryDTO
  );

  return ApiResponse.ok(res, result);
});
