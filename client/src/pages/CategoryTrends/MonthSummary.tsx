import { CategoryTrendMonth } from '@lyra/shared';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TrendBadge from '@/components/features/categoryTrends/TrendBadge';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { formatMonthTitle } from '@/utils/entities/categoryTrends';

interface MonthSummaryProps {
  period: string;
  entry: CategoryTrendMonth | undefined;
}

const MonthSummary = ({ period, entry }: MonthSummaryProps) => {
  const { t } = useTranslation('categoryTrends');

  return (
    <Column spacing={0.5}>
      <Typography variant="body2" color="text.secondary">
        {formatMonthTitle(period)}
      </Typography>
      <Row alignItems="center" flexWrap="wrap" columnGap={1.5} rowGap={0.5}>
        <CurrencyText value={entry?.total ?? 0} variant="h4" fontWeight={700} />
        {entry && <TrendBadge delta={entry.delta} />}
      </Row>
      {entry?.budget != null && (
        <Typography variant="body2" color="text.secondary">
          {t('chart.budget')}:{' '}
          <CurrencyText value={entry.budget} variant="inherit" color="inherit" />
        </Typography>
      )}
    </Column>
  );
};

export default MonthSummary;
