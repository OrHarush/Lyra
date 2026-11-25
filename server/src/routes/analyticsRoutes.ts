import express from 'express';

import {
  trackCategoryTrendsViewController,
  trackPwaInstallController,
  trackShareClickController,
} from '../controllers/analyticsController';
import { validateBody } from '../middlewares/validate';
import { ShareClickSchema } from '../schemas/analyticsSchemas';

const router = express.Router();

router.post('/share-click', validateBody(ShareClickSchema), trackShareClickController);
router.post('/pwa-install', trackPwaInstallController);
router.post('/category-trends-view', trackCategoryTrendsViewController);

export default router;
