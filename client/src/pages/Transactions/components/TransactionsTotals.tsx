import { Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { TransactionTotalsDto } from '@/types/Transaction';

interface TransactionsTotalsProps {
  totals?: TransactionTotalsDto;
  isLoading: boolean;
}

const TransactionsTotals = ({ totals, isLoading }: TransactionsTotalsProps) => {
  const { t } = useTranslation('transactions');

  if (isLoading || !totals) {
    return <Skeleton variant="text" width={280} height={28} />;
  }

  return (
    <Row spacing={{ xs: 2, md: 4 }} alignItems="center" flexWrap="wrap" useFlexGap>
      <Row spacing={1} alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          {t('totals.income')}
        </Typography>
        <CurrencyText value={totals.income} hasColor={totals.income !== 0} hasSign fontWeight={600} />
      </Row>
      <Row spacing={1} alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          {t('totals.expenses')}
        </Typography>
        <CurrencyText value={-totals.expenses || 0} hasColor={totals.expenses !== 0} fontWeight={600} />
      </Row>
      <Row spacing={1} alignItems="baseline">
        <Typography variant="body2" color="text.secondary">
          {t('totals.net')}
        </Typography>
        <CurrencyText value={totals.net} hasColor={totals.net !== 0} hasSign fontWeight={600} />
      </Row>
    </Row>
  );
};

export default TransactionsTotals;
