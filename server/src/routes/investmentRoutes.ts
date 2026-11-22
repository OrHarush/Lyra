import {
  CreateInvestmentPurchaseSchema,
  InvestmentHistoryQuerySchema,
  InvestmentPurchaseIdParamSchema,
  SearchInstrumentsQuerySchema,
  UpdateInvestmentPurchaseSchema,
} from '@lyra/shared';
import { NextFunction, Request, Response, Router } from 'express';

import {
  createPurchase,
  deletePurchase,
  getHistory,
  getPurchases,
  getPurchaseTrends,
  getSummary,
  searchInstruments,
  updatePurchase,
} from '../controllers/investmentController';
import { ApiError } from '../errors/ApiError';
import { validateBody, validateQuery } from '../middlewares/validate';

const validateIdParam = (req: Request, _res: Response, next: NextFunction) => {
  if (!InvestmentPurchaseIdParamSchema.safeParse(req.params).success) {
    throw ApiError.badRequest('Invalid purchase ID');
  }

  next();
};

const router = Router();

router.get('/instruments/search', validateQuery(SearchInstrumentsQuerySchema), searchInstruments);
router.get('/purchases', getPurchases);
router.get('/purchases/trends', getPurchaseTrends);
router.post('/purchases', validateBody(CreateInvestmentPurchaseSchema), createPurchase);
router.patch(
  '/purchases/:id',
  validateIdParam,
  validateBody(UpdateInvestmentPurchaseSchema),
  updatePurchase
);
router.delete('/purchases/:id', validateIdParam, deletePurchase);
router.get('/summary', getSummary);
router.get('/history', validateQuery(InvestmentHistoryQuerySchema), getHistory);

export default router;
