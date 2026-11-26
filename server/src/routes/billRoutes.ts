import { ApproveBillSchema } from '@lyra/shared';
import { Router } from 'express';

import { approveBill, getPendingBills } from '../controllers/billController';
import { validateBody } from '../middlewares/validate';

const router = Router();

router.get('/pending', getPendingBills);
router.post('/:id/approve', validateBody(ApproveBillSchema), approveBill);

export default router;
