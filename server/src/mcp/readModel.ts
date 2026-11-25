import { ApiError } from '../errors/ApiError';
import * as accountRepository from '../repositories/accountRepository';
import * as categoryRepository from '../repositories/categoryRepository';
import * as purchaseRepository from '../repositories/investmentPurchaseRepository';
import * as paymentMethodRepository from '../repositories/paymentMethodRepository';
import * as workspaceRepository from '../repositories/workspaceRepository';
import * as goalService from '../services/goalService';
import {
  createInvestmentService,
  marketDataGateway,
} from '../services/investments/investmentService';
import * as recurringTemplateService from '../services/recurringTemplateService';
import * as categoryTrendsService from '../services/transactions/categoryTrendsService';
import * as transactionService from '../services/transactions/transactionService';

// The only door from MCP tools into the data layer. Everything exported here reads; tools are
// lint-blocked from importing services, repositories or models directly (see .eslintrc.json).

const rejectWrite = async (): Promise<never> => {
  throw ApiError.forbidden('MCP access is read-only');
};

const readOnlyInvestments = createInvestmentService({
  purchases: {
    findAllByUser: purchaseRepository.findAllByUser,
    findOneByUser: purchaseRepository.findOneByUser,
    insert: rejectWrite,
    updateOneByUser: rejectWrite,
    deleteOneByUser: rejectWrite,
  },
  market: marketDataGateway,
  now: () => new Date(),
});

export const findWorkspace = async (workspaceId: string) => {
  const workspace = await workspaceRepository.findById(workspaceId);

  if (!workspace) {
    throw ApiError.notFound('Workspace not found');
  }

  return workspace;
};

export const loadReferenceData = async (workspaceId: string) => {
  const [accounts, categories, paymentMethods] = await Promise.all([
    accountRepository.findMany(workspaceId),
    categoryRepository.findMany(workspaceId),
    paymentMethodRepository.findMany(workspaceId),
  ]);

  return { accounts, categories, paymentMethods };
};

export const findTransactions = transactionService.findAll;
export const getMonthSummary = transactionService.getTransactionSummary;
export const getCashflowCalendar = transactionService.getTransactionCalendar;
export const getCategoryTrends = categoryTrendsService.getCategoryTrends;
export const listRecurringTemplates = recurringTemplateService.getByWorkspace;
export const listGoals = goalService.findAll;
export const getGoalProjection = goalService.getGoalProjection;
export const getInvestmentSummary = readOnlyInvestments.getSummary;
export const getInvestmentHistory = readOnlyInvestments.getHistory;
