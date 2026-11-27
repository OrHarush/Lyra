import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { TransactionDto } from '@/types/Transaction';
import { getPaymentMethodDisplayName } from '@/utils/entities/paymentMethod';
import { getTransactionDisplayDate } from '@/utils/entities/transaction';

const TransactionSubtitle = ({ transaction }: { transaction: TransactionDto }) => {
  const { t } = useTranslation('paymentMethods');
  const paymentMethodName = getPaymentMethodDisplayName(transaction.paymentMethod, t);
  const displayDate = getTransactionDisplayDate(transaction);
  const date = displayDate ? dayjs(displayDate).format('DD/MM/YYYY') : '';

  return (
    <Typography variant="caption" color="text.secondary" noWrap>
      {[paymentMethodName, date].filter(Boolean).join(' · ')}
    </Typography>
  );
};

export default TransactionSubtitle;
