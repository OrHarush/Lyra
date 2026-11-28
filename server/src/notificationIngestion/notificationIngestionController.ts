import { IngestNotificationDTO } from '@lyra/shared';
import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import { ingestNotification } from './notificationIngestionService';

export const ingestWalletNotification = asyncHandler(async (req: Request, res: Response) => {
  const result = await ingestNotification(req.userId, req.validatedBody as IngestNotificationDTO);

  return ApiResponse.ok(res, result);
});
