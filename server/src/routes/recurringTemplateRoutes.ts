import {
  CreateRecurringTemplateSchema,
  DeactivateFromSchema,
  MaterializeRecurringOccurrenceSchema,
  SplitRecurringTemplateSchema,
  UpdateFixedExpenseDetailsSchema,
  UpdateRecurringTemplateSchema,
} from '@lyra/shared';
import { Router } from 'express';

import {
  cancelTemplate,
  createTemplate,
  createTemplateWithTransactions,
  deactivateFrom,
  deleteTemplate,
  getFixedExpenses,
  getTemplateById,
  getTemplates,
  materializeOccurrence,
  splitTemplate,
  updateFixedExpenseDetails,
  updateTemplate,
} from '../controllers/recurringTemplateController';
import { validateBody } from '../middlewares/validate';

const router = Router();

router.get('/', getTemplates);
router.get('/fixed-expenses', getFixedExpenses);
router.get('/:id', getTemplateById);
router.post(
  '/with-transactions',
  validateBody(CreateRecurringTemplateSchema),
  createTemplateWithTransactions
);
router.post('/', validateBody(CreateRecurringTemplateSchema), createTemplate);
router.post('/:id/deactivate-from', validateBody(DeactivateFromSchema), deactivateFrom);
router.post(
  '/:id/materialize',
  validateBody(MaterializeRecurringOccurrenceSchema),
  materializeOccurrence
);
router.post('/:id/cancel', cancelTemplate);
router.put('/:id/details', validateBody(UpdateFixedExpenseDetailsSchema), updateFixedExpenseDetails);
router.put('/:id/split', validateBody(SplitRecurringTemplateSchema), splitTemplate);
router.put('/:id', validateBody(UpdateRecurringTemplateSchema), updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
