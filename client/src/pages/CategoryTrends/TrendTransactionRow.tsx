import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { TransactionDto } from '@/types/Transaction';

interface TrendTransactionRowProps {
  transaction: TransactionDto;
}

const TrendTransactionRow = ({ transaction }: TrendTransactionRowProps) => {
  const { t } = useTranslation('categoryTrends');
  const date = dayjs(transaction.date).format('DD/MM/YYYY');
  const subtitle = [
    date,
    transaction.paymentMethod?.name,
    transaction.isVirtual ? t('transactions.scheduled') : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Row alignItems="center" spacing={1.5} sx={{ py: 1 }}>
      <Column sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {transaction.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      </Column>
      <CurrencyText value={-transaction.amount} hasColor variant="body1" fontWeight={700} />
    </Row>
  );
};

export default TrendTransactionRow;
