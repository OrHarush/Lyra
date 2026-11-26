import { Card, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { FixedExpensesSummaryProps } from '@/pages/FixedExpenses/FixedExpensesSummary';
import SpendDonut from '@/pages/FixedExpenses/SpendDonut';
import { DONUT_SIZE, getCardStyle } from '@/pages/FixedExpenses/styles';
import { useRelativeChargeLabel } from '@/pages/FixedExpenses/useRelativeChargeLabel';

const CompactSummaryCard = ({ totals, groups, nextCharge }: FixedExpensesSummaryProps) => {
  const { t } = useTranslation('fixedExpenses');
  const getWhen = useRelativeChargeLabel();

  return (
    <Card sx={getCardStyle()}>
      <Row alignItems="center" spacing={2.5}>
        <SpendDonut groups={groups} monthly={totals.monthly} size={DONUT_SIZE.compact} />
        <Column spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {t('summary.perYearLabel')}
          </Typography>
          <CurrencyText value={totals.yearly} variant="h5" fontWeight={700} />
          <Typography variant="body2" color="text.secondary">
            {`${t('summary.nextCharge')}: ${nextCharge.name}`}
          </Typography>
          <Row spacing={0.5} alignItems="baseline" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" color="text.secondary">
              {getWhen(nextCharge.nextDate)}
            </Typography>
            <CurrencyText value={nextCharge.amount} variant="body2" color="text.secondary" />
          </Row>
        </Column>
      </Row>
    </Card>
  );
};

export default CompactSummaryCard;
