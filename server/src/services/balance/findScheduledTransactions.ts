import * as recurringTemplateRepository from '../../repositories/recurringTemplateRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import { buildVirtualTransactions } from '../transactions/buildVirtualTransactions';

interface ScheduledRange {
  from: Date;
  to: Date;
  accountId?: string;
}

// Real rows plus the recurring ones that haven't been generated yet.
export const findScheduledTransactions = async (
  workspaceId: string,
  { from, to, accountId }: ScheduledRange
) => {
  const [transactions, templates] = await Promise.all([
    transactionRepository.findMany(workspaceId, { accountId, from, to }),
    recurringTemplateRepository.findActiveForDateRangePopulated(workspaceId, from, to),
  ]);

  return [...transactions, ...buildVirtualTransactions(templates, transactions, from, to)];
};
