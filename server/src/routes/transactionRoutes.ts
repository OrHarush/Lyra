import { CreateTransactionSchema, UpdateTransactionSchema } from '@lyra/shared';
import { Router } from 'express';

import {
  createTransaction,
  deleteTransaction,
  exportTransactions,
  getCategoryTrends,
  getQuickChips,
  getReviewCount,
  getReviewList,
  getTransactionById,
  getTransactionCalendar,
  getTransactionCount,
  getTransactions,
  getTransactionSummary,
  reviewTransactions,
  updateTransaction,
} from '../controllers/transactionController';
import { validateBody, validateQuery } from '../middlewares/validate';
import { ExportTransactionsSchema } from '../schemas/transactionExportSchemas';
import {
  GetCategoryTrendsSchema,
  GetTransactionCalendarSchema,
  GetTransactionsSchema,
  GetTransactionSummarySchema,
  ReviewTransactionsSchema,
} from '../schemas/transactionSchemas';

const router = Router();

router.get('/count', getTransactionCount);
router.get('/quick-chips', getQuickChips);
router.get('/review-count', getReviewCount);
router.get('/review', getReviewList);
router.post('/review', validateBody(ReviewTransactionsSchema), reviewTransactions);
router.get('/export', validateQuery(ExportTransactionsSchema), exportTransactions);
router.get('/calendar', validateQuery(GetTransactionCalendarSchema), getTransactionCalendar);
router.get('/category-trends', validateQuery(GetCategoryTrendsSchema), getCategoryTrends);
router.get('/summary', validateQuery(GetTransactionSummarySchema), getTransactionSummary);
router.get('/', validateQuery(GetTransactionsSchema), getTransactions);
router.get('/:id', getTransactionById);
router.post('/', validateBody(CreateTransactionSchema), createTransaction);
router.put('/:id', validateBody(UpdateTransactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
