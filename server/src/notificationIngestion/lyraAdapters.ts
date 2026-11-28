import * as automationTransactionService from '../services/transactions/automationTransactionService';
import { LyraTransactionsPort } from './ports';

// The only file in this module that reaches into the rest of Lyra. Replace it with an HTTP
// client when the module is extracted to its own service.
export const lyraTransactions: LyraTransactionsPort = {
  createAutomationTransaction: async request => {
    const { transaction } = await automationTransactionService.createAutomationTransaction({
      ...request,
      source: 'google_pay',
    });

    return {
      transactionId: transaction._id.toString(),
      categoryId: transaction.category?.toString() ?? null,
    };
  },
};
