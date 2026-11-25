import { Router } from 'express';

import {
  approveAuthorizationRequest,
  createPersonalToken,
  denyAuthorizationRequest,
  getAuthorizationRequest,
  listConnections,
  revokeConnection,
} from '../controllers/mcpConnectionController';
import { validateBody } from '../middlewares/validate';
import {
  ApproveMcpAuthorizationSchema,
  CreatePersonalMcpTokenSchema,
} from '../schemas/mcpConnectionSchemas';

const router = Router();

router.get('/oauth/requests/:requestId', getAuthorizationRequest);
router.post(
  '/oauth/requests/:requestId/approve',
  validateBody(ApproveMcpAuthorizationSchema),
  approveAuthorizationRequest
);
router.post('/oauth/requests/:requestId/deny', denyAuthorizationRequest);
router.get('/connections', listConnections);
router.post(
  '/connections/personal',
  validateBody(CreatePersonalMcpTokenSchema),
  createPersonalToken
);
router.delete('/connections/:id', revokeConnection);

export default router;
