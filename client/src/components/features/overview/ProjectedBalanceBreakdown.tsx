import { Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { BalanceForecastDto } from '@/types/BalanceForecast';

const ProjectedBalanceBreakdown = ({
  currentBalance,
  expectedIncome,
  expectedExpenses,
  projectedBalance,
}: BalanceForecastDto) => {
  const { t } = useTranslation('overview');

  return (
    <Column spacing={0.5} sx={{ minWidth: 240 }}>
      <Row justifyContent="space-between" alignItems="center" spacing={3}>
        <Typography variant="body2" color="text.secondary">
          {t('projectedBreakdown.currentBalance')}
        </Typography>
        <CurrencyText value={currentBalance} variant="body2" />
      </Row>

      {expectedIncome !== 0 && (
        <Row justifyContent="space-between" alignItems="center" spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {t('projectedBreakdown.expectedIncome')}
          </Typography>
          <CurrencyText value={expectedIncome} variant="body2" hasSign hasColor />
        </Row>
      )}

      {expectedExpenses !== 0 && (
        <Row justifyContent="space-between" alignItems="center" spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {t('projectedBreakdown.expectedExpenses')}
          </Typography>
          <CurrencyText value={-expectedExpenses} variant="body2" hasColor />
        </Row>
      )}

      <Divider sx={{ my: 1 }} />

      <Row justifyContent="space-between" alignItems="center" spacing={3}>
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          {t('projectedBreakdown.projected')}
        </Typography>
        <CurrencyText value={projectedBalance} variant="body2" fontWeight={500} />
      </Row>
    </Column>
  );
};

export default ProjectedBalanceBreakdown;
