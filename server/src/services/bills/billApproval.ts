import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { IRecurringTemplate } from '../../models/RecurringTemplate';
import { ITransaction } from '../../models/Transaction';
import { IWorkspaceMember } from '../../models/WorkspaceMember';

dayjs.extend(utc);

export const BILLS_IN_ESTIMATE = 3;

// Occurrences dated before the bill was set up are history the user is back-filling, so they
// don't ask for approval.
export const isDueForApproval = (
  template: Pick<IRecurringTemplate, 'kind' | 'createdAt'>,
  occurrenceDate: Date
) => {
  if (template.kind !== 'bill' || !template.createdAt) {
    return false;
  }

  const createdOn = dayjs.utc(template.createdAt).add(3, 'hours').startOf('day');

  return !dayjs.utc(occurrenceDate).startOf('day').isBefore(createdOn);
};

export const estimateBillAmount = (recentAmounts: number[], fallback: number) => {
  if (recentAmounts.length === 0) {
    return fallback;
  }

  const total = recentAmounts.reduce((sum, amount) => sum + amount, 0);

  return Math.round(total / recentAmounts.length);
};

// Editing the amount of a waiting bill is the user stating what it really was.
export const confirmsAwaitingBill = (
  existing: Pick<ITransaction, 'isAwaitingApproval' | 'amount'>,
  newAmount: number | undefined
) => !!existing.isAwaitingApproval && newAmount !== undefined && newAmount !== existing.amount;

// The person who set the bill up approves it. If they left the household, its owner does.
export const selectBillsAssignedTo = <Bill extends Pick<ITransaction, 'userId'>>(
  bills: Bill[],
  userId: string,
  members: Pick<IWorkspaceMember, 'userId' | 'role'>[]
) => {
  const memberIds = new Set(members.map(member => member.userId.toString()));
  const isOwner = members.some(
    member => member.role === 'owner' && member.userId.toString() === userId
  );

  return bills.filter(bill => {
    const creatorId = bill.userId.toString();

    return creatorId === userId || (isOwner && !memberIds.has(creatorId));
  });
};
