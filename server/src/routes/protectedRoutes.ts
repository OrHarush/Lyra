import { Router } from 'express';

import { activityPingMiddleware } from '../middlewares/activityPingMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { workspaceContextMiddleware } from '../middlewares/workspaceContextMiddleware';
import accountRoutes from './accountRoutes';
import adminRoutes from './adminRoutes';
import analyticsRoutes from './analyticsRoutes';
import authedInvitationRoutes from './authedInvitationRoutes';
import budgetRoutes from './budgetRoutes';
import categoryRoutes from './categoryRoutes';
import chatRoutes from './chatRoutes';
import feedbackRoutes from './feedbackRoutes';
import goalRoutes from './goalRoutes';
import importRoutes from './importRoutes';
import monthlyReportRoutes from './monthlyReportRoutes';
import paymentMethodRoutes from './paymentMethodsRoutes';
import recurringTemplateRoutes from './recurringTemplateRoutes';
import sharedWorkspaceRoutes from './sharedWorkspaceRoutes';
import transactionRoutes from './transactionRoutes';
import userRoutes from './userRoutes';

const protectedRoutes = Router();

protectedRoutes.use(authMiddleware, workspaceContextMiddleware, activityPingMiddleware);

protectedRoutes.use('/workspaces', sharedWorkspaceRoutes);
protectedRoutes.use('/invitations', authedInvitationRoutes);
protectedRoutes.use('/users', userRoutes);
protectedRoutes.use('/transactions', transactionRoutes);
protectedRoutes.use('/accounts', accountRoutes);
protectedRoutes.use('/categories', categoryRoutes);
protectedRoutes.use('/budgets', budgetRoutes);
protectedRoutes.use('/goals', goalRoutes);
protectedRoutes.use('/recurring-templates', recurringTemplateRoutes);
protectedRoutes.use('/payment-methods', paymentMethodRoutes);
protectedRoutes.use('/feedback', feedbackRoutes);
protectedRoutes.use('/monthly-report', monthlyReportRoutes);
protectedRoutes.use('/admin', adminRoutes);
protectedRoutes.use('/analytics', analyticsRoutes);
protectedRoutes.use('/chat', chatRoutes);
protectedRoutes.use('/import', importRoutes);

export default protectedRoutes;
