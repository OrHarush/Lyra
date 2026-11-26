import { BillType } from '@lyra/shared';

export interface PendingBill {
  transactionId: string;
  name: string;
  billType: BillType | null;
  amount: number;
  date: Date;
  createdAt: Date;
}
