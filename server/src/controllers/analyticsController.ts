import { Request, Response } from 'express';

import { ApiError } from '../errors/ApiError';
import { ApiResponse } from '../http/ApiResponse';
import { asyncHandler } from '../middlewares/asyncHandler';
import * as analyticsService from '../services/analyticsService';

export const trackShareClickController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw ApiError.unauthorized('Unauthorized');
  }

  await analyticsService.recordShareClick(req.userId);

  return ApiResponse.ok(res, { tracked: true });
});

export const trackPwaInstallController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    throw ApiError.unauthorized('Unauthorized');
  }

  await analyticsService.recordPwaInstall(req.userId);

  return ApiResponse.ok(res, { tracked: true });
});

export const trackCategoryTrendsViewController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.userId) {
      throw ApiError.unauthorized('Unauthorized');
    }

    await analyticsService.recordCategoryTrendsView(req.userId);

    return ApiResponse.ok(res, { tracked: true });
  }
);
