import { Request, Response } from 'express';

import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as notificationService from '../services/notifications/notificationService';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await notificationService.getNotifications(req.userId, req.workspaceId);

  return ApiResponse.ok(res, notifications);
});
