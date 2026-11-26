import { fromCents, toCents } from '@lyra/shared';
import mongoose from 'mongoose';

import { ApiError } from '../../errors/ApiError';
import * as recurringTemplateRepository from '../../repositories/recurringTemplateRepository';
import * as transactionRepository from '../../repositories/transactionRepository';
import { PendingBill } from '../../types/PendingBill';
import { ITransactionPopulated } from '../../types/Transaction';
import { fingerprintForTransaction } from '../../utils/importFingerprint';
import { syncAccountBalance } from '../balanceService';
import { invalidateQuickChipsCache } from '../transactions/quickChipsService';

export const getPendingBills = async (workspaceId: string) => {
  const bills = await transactionRepository.findAwaitingApproval(workspaceId);

  return toPendingBills(bills, workspaceId);
};

export const toPendingBills = async (
  bills: ITransactionPopulated[],
  workspaceId: string
): Promise<PendingBill[]> => {
  const templateIds = bills.flatMap(bill => (bill.templateId ? [bill.templateId] : []));
  const templates = await recurringTemplateRepository.findByIds(templateIds, workspaceId);
  const billTypes = new Map(templates.map(template => [String(template._id), template.billType]));

  return bills.map(bill => ({
    transactionId: String(bill._id),
    name: bill.name ?? '',
    billType: billTypes.get(String(bill.templateId)) ?? null,
    amount: fromCents(bill.amount),
    date: bill.date!,
    createdAt: bill.createdAt!,
  }));
};

export const approveBill = async (id: string, amount: number, workspaceId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ApiError.badRequest('Invalid transaction ID');
  }

  const bill = await transactionRepository.findById(id, workspaceId);

  if (!bill) {
    throw ApiError.notFound('BILL_NOT_FOUND');
  }

  const amountInCents = toCents(amount);
  const accountId = bill.account?._id.toString();
  const importFingerprint = fingerprintForTransaction({
    userId: bill.userId,
    account: accountId,
    date: bill.date,
    amount: amountInCents,
    type: bill.type,
  });
  const approved = await transactionRepository.approveAwaiting(
    id,
    { amount: amountInCents, importFingerprint },
    workspaceId
  );

  if (!approved) {
    throw ApiError.conflict('BILL_ALREADY_APPROVED');
  }

  invalidateQuickChipsCache(workspaceId);

  if (accountId) {
    await syncAccountBalance(workspaceId, accountId);
  }

  return { transactionId: id, amount: fromCents(approved.amount) };
};
