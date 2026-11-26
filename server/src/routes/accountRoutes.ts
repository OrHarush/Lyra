import { CreateAccountSchema, UpdateAccountSchema } from '@lyra/shared';
import { Router } from 'express';

import {
  createAccount,
  deleteAccount,
  getAccountById,
  getAccountForecast,
  getAccounts,
  getLinkedTransactionsCount,
  setPrimaryAccount,
  updateAccount,
} from '../controllers/accountController';
import { validateBody, validateQuery } from '../middlewares/validate';
import { GetBalanceForecastSchema } from '../schemas/accountSchemas';

const router = Router();

router.get('/', getAccounts);
router.get('/:id', getAccountById);
router.get('/:id/linked-transactions', getLinkedTransactionsCount);
router.get('/:id/forecast', validateQuery(GetBalanceForecastSchema), getAccountForecast);
router.post('/', validateBody(CreateAccountSchema), createAccount);
router.put('/:id', validateBody(UpdateAccountSchema), updateAccount);
router.patch('/:id', validateBody(UpdateAccountSchema), updateAccount);
router.patch('/:id/primary', setPrimaryAccount);
router.delete('/:id', deleteAccount);

export default router;
