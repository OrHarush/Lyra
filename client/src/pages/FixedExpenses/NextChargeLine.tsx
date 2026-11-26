import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { FixedExpenseDto } from '@/types/FixedExpense';

const NextChargeLine = ({ item }: { item: FixedExpenseDto }) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Row spacing={0.5} alignItems="baseline" flexWrap="wrap" useFlexGap>
      <Typography variant="body2" color="text.secondary">
        {`${t('summary.nextCharge')}:`}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {t('summary.nextChargeOn', { name: item.name, date: dayjs(item.nextDate).format('DD/MM') })}
      </Typography>
      <CurrencyText value={item.amount} variant="body2" fontWeight={600} />
    </Row>
  );
};

export default NextChargeLine;
