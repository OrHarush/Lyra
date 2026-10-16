import { Router } from 'express';

import { authLimiter } from '../config/rateLimiters';
import authRoutes from './authRoutes';
import cronRoutes from './cronRoutes';
import publicInvitationRoutes from './publicInvitationRoutes';
import shortcutRoutes from './shortcutRoutes';

const publicRoutes = Router();

publicRoutes.use('/auth', authLimiter, authRoutes);
publicRoutes.use('/cron', cronRoutes);
// Also mounted in protectedRoutes: this one serves the unauthenticated invite-link lookup.
publicRoutes.use('/invitations', publicInvitationRoutes);
publicRoutes.use('/shortcut', shortcutRoutes);
export default publicRoutes;
