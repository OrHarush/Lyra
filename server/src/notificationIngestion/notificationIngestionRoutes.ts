import { IngestNotificationSchema, SetPendingCategorySchema } from '@lyra/shared';
import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { validateBody } from '../middlewares/validate';
import {
  ingestWalletNotification,
  setPendingTransactionCategory,
} from './notificationIngestionController';

// One person paying with a phone never gets near this; an offline queue flushing after a day
// without signal can burst, so it is per minute and generous.
const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => req.userId ?? ipKeyGenerator(req.ip ?? ''),
  message: 'Too many notifications, please slow down.',
});

// Mounted behind the caller's auth middleware, which must set req.userId.
const notificationIngestionRoutes = Router();

notificationIngestionRoutes.use(ingestionLimiter);

notificationIngestionRoutes.post(
  '/',
  validateBody(IngestNotificationSchema),
  ingestWalletNotification
);
notificationIngestionRoutes.patch(
  '/transactions/:transactionId/category',
  validateBody(SetPendingCategorySchema),
  setPendingTransactionCategory
);

export default notificationIngestionRoutes;
