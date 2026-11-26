import { Box, Card, Divider, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import DonutLegendRow from '@/pages/FixedExpenses/DonutLegendRow';
import { FixedExpensesSummaryProps } from '@/pages/FixedExpenses/FixedExpensesSummary';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import SpendDonut from '@/pages/FixedExpenses/SpendDonut';
import {
  DONUT_SIZE,
  getCardStyle,
  getNextChargeBoxStyle,
  getSummaryGridStyle,
} from '@/pages/FixedExpenses/styles';
import { useRelativeChargeLabel } from '@/pages/FixedExpenses/useRelativeChargeLabel';

const WideSummaryCards = ({ totals, groups, nextCharge }: FixedExpensesSummaryProps) => {
  const { t } = useTranslation('fixedExpenses');
  const getWhen = useRelativeChargeLabel();

  return (
    <Box sx={getSummaryGridStyle()}>
      <Card sx={getCardStyle()}>
        <Column height="100%" justifyContent="space-between" spacing={2}>
          <Column spacing={0.5}>
            <Typography color="text.secondary">{t('summary.monthlyLabel')}</Typography>
            <CurrencyText
              value={totals.monthly}
              variant="h2"
              fontWeight={700}
              sx={{ alignSelf: 'flex-start' }}
            />
            <Row spacing={0.5} alignItems="baseline">
              <CurrencyText value={totals.yearly} variant="body1" color="text.secondary" />
              <Typography color="text.secondary">{t('summary.perYear')}</Typography>
            </Row>
          </Column>
          <Row alignItems="center" spacing={1.5} sx={getNextChargeBoxStyle()}>
            <FixedExpenseThumbnail item={nextCharge} size={44} />
            <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
              {`${t('summary.nextCharge')}: `}
              <strong>{nextCharge.name}</strong>
              {` ${getWhen(nextCharge.nextDate)}`}
            </Typography>
            <CurrencyText value={nextCharge.amount} fontWeight={700} />
          </Row>
        </Column>
      </Card>
      <Card sx={getCardStyle()}>
        <Row height="100%" alignItems="center" spacing={4}>
          <SpendDonut groups={groups} monthly={totals.monthly} size={DONUT_SIZE.wide} />
          <Column sx={{ flex: 1, minWidth: 0 }}>
            {groups.map((group, index) => (
              <Fragment key={group.id}>
                {index > 0 && <Divider />}
                <DonutLegendRow group={group} />
              </Fragment>
            ))}
          </Column>
        </Row>
      </Card>
    </Box>
  );
};

export default WideSummaryCards;
