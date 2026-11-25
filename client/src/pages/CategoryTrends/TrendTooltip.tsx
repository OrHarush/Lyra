import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { TrendChartRow } from '@/utils/entities/categoryTrends';

interface TrendTooltipProps {
  active?: boolean;
  payload?: { payload: TrendChartRow }[];
}

const TrendTooltip = ({ active, payload }: TrendTooltipProps) => {
  const { t } = useTranslation('categoryTrends');
  const row = payload?.[0]?.payload;

  if (!active || !row) {
    return null;
  }

  return (
    <Paper sx={{ px: 1.5, py: 1 }}>
      <Column spacing={0.25}>
        <Typography variant="caption" color="text.secondary">
          {row.label}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {t('chart.spent')}: <CurrencyText value={row.total} variant="inherit" />
        </Typography>
        {row.budget !== null && (
          <Typography variant="body2" color="text.secondary">
            {t('chart.budget')}: <CurrencyText value={row.budget} variant="inherit" />
          </Typography>
        )}
      </Column>
    </Paper>
  );
};

export default TrendTooltip;
