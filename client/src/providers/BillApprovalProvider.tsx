import { createContext, ReactNode, useContext, useState } from 'react';

import BillApprovalDialog from '@/components/features/bills/BillApprovalDialog';
import { PendingBillDto } from '@/types/Bill';

type OpenBillApproval = (bill: PendingBillDto) => void;

const BillApprovalContext = createContext<OpenBillApproval | undefined>(undefined);

// The sheet lives here, outside the rows and panels that open it, so their click and swipe
// handlers never receive events from inside it.
export const BillApprovalProvider = ({ children }: { children: ReactNode }) => {
  const [bill, setBill] = useState<PendingBillDto | null>(null);

  const closeBillApproval = () => setBill(null);

  return (
    <BillApprovalContext.Provider value={setBill}>
      {children}
      {bill && (
        <BillApprovalDialog
          key={bill.transactionId}
          isOpen
          closeDialog={closeBillApproval}
          bill={bill}
        />
      )}
    </BillApprovalContext.Provider>
  );
};

export const useBillApproval = () => {
  const openBillApproval = useContext(BillApprovalContext);

  if (!openBillApproval) {
    throw new Error('useBillApproval must be used within BillApprovalProvider');
  }

  return openBillApproval;
};
