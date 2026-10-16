import { Router } from 'express';

import protectedRoutes from './protectedRoutes';
import publicRoutes from './publicRoutes';

const apiRouter = Router();

// Order is the auth boundary: public must come first, protected catches everything else.
apiRouter.use(publicRoutes);
apiRouter.use(protectedRoutes);

export default apiRouter;
