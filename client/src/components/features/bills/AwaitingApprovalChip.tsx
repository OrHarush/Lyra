import { Chip } from '@mui/material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { usePendingBills } from '@/hooks/entities/useBills';
import { useBillApproval } from '@/providers/BillApprovalProvider';
import { TransactionDto } from '@/types/Transaction';

interface AwaitingApprovalChipProps {
  transaction: TransactionDto;
}

const AwaitingApprovalChip = ({ transaction }: AwaitingApprovalChipProps) => {
  const { t } = useTranslation('bills');
  const openBillApproval = useBillApproval();
  const { pendingBills } = usePendingBills();

  const approveFromRow = (event: MouseEvent) => {
    event.stopPropagation();

    const bill = pendingBills.find(pending => pending.transactionId === transaction._id);

    openBillApproval(
      bill ?? {
        transactionId: transaction._id,
        name: transaction.name,
        billType: null,
        amount: transaction.amount,
        date: transaction.date ?? transaction.createdAt,
        createdAt: transaction.createdAt,
      }
    );
  };

  return (
    <Chip
      label={t('awaitingChip')}
      size="small"
      color="warning"
      onClick={approveFromRow}
      sx={{ fontSize: '0.7rem', height: 22, flexShrink: 0 }}
    />
  );
};

export default AwaitingApprovalChip;
