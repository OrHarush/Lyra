import * as transactionRepository from '../../repositories/transactionRepository';
import * as workspaceMemberRepository from '../../repositories/workspaceMemberRepository';
import { AppNotification } from '../../types/Notification';
import { selectBillsAssignedTo } from '../bills/billApproval';
import { toPendingBills } from '../bills/billService';

export const findBillApprovalNotifications = async (
  userId: string,
  workspaceId: string
): Promise<AppNotification[]> => {
  const [bills, members] = await Promise.all([
    transactionRepository.findAwaitingApproval(workspaceId),
    workspaceMemberRepository.findByWorkspace(workspaceId),
  ]);
  const assigned = selectBillsAssignedTo(bills, userId, members);
  const pendingBills = await toPendingBills(assigned, workspaceId);

  return pendingBills.map(bill => ({
    id: `billApproval-${bill.transactionId}`,
    type: 'billApproval',
    section: 'action',
    createdAt: bill.createdAt,
    data: bill,
  }));
};
