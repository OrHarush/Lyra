import * as recurringTemplateRepository from '../../repositories/recurringTemplateRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import { buildVirtualTransactions } from '../transactions/buildVirtualTransactions';

interface ScheduledRange {
  from: Date;
  to: Date;
  accountId?: string;
}

// Real rows plus the recurring ones that haven't been generated yet. Bills still awaiting
// approval are included however old they are, because they are still expected to be paid.
export const findScheduledTransactions = async (
  workspaceId: string,
  { from, to, accountId }: ScheduledRange
) => {
  const [transactions, olderAwaitingBills, templates] = await Promise.all([
    transactionRepository.findMany(workspaceId, { accountId, from, to }),
    transactionRepository.findAwaitingApproval(workspaceId, { accountId, before: from }),
    recurringTemplateRepository.findActiveForDateRangePopulated(workspaceId, from, to),
  ]);

  return [
    ...olderAwaitingBills,
    ...transactions,
    ...buildVirtualTransactions(templates, transactions, from, to),
  ];
};
