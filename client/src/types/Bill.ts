import type { BillType } from '@lyra/shared';

export interface PendingBillDto {
  transactionId: string;
  name: string;
  billType: BillType | null;
  amount: number;
  date: string;
  createdAt: string;
}
