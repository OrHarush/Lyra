import { Router } from 'express';

import { shortcutPollLimiter } from '../config/rateLimiters';
import {
  approveShortcut,
  createShortcutAndroidToken,
  createShortcutAndroidTransaction,
  createShortcutTransaction,
  downloadShortcutMacro,
  getShortcutAndroidConnection,
  getShortcutCategories,
  getShortcutStatus,
  getShortcutToken,
  initShortcut,
  revokeShortcut,
} from '../controllers/shortcutController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { shortcutAuthMiddleware } from '../middlewares/shortcutAuthMiddleware';
import { validateBody } from '../middlewares/validate';
import { notificationIngestionRoutes } from '../notificationIngestion';
import {
  ApproveSchema,
  ShortcutAndroidTransactionSchema,
  ShortcutTransactionSchema,
} from '../schemas/shortcutSchemas';

const router = Router();

router.post('/init', authMiddleware, initShortcut);
router.post('/approve', authMiddleware, validateBody(ApproveSchema), approveShortcut);
router.get('/macro', authMiddleware, downloadShortcutMacro);
router.post('/android/token', authMiddleware, createShortcutAndroidToken);
router.get('/connection', authMiddleware, getShortcutAndroidConnection);
router.get('/token', shortcutPollLimiter, getShortcutToken);
router.get('/status', shortcutAuthMiddleware, getShortcutStatus);
router.delete('/revoke', authMiddleware, revokeShortcut);
router.get('/categories', shortcutAuthMiddleware, getShortcutCategories);
router.post(
  '/transaction',
  shortcutAuthMiddleware,
  validateBody(ShortcutTransactionSchema),
  createShortcutTransaction
);
router.post(
  '/transaction/android',
  shortcutAuthMiddleware,
  validateBody(ShortcutAndroidTransactionSchema),
  createShortcutAndroidTransaction
);
router.use('/notifications', shortcutAuthMiddleware, notificationIngestionRoutes);

export default router;
