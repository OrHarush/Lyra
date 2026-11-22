import { Chip, Typography, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import BreakdownStat from '@/pages/Investments/BreakdownStat';
import ProfitPill from '@/pages/Investments/ProfitPill';
import ValueBreakdownBar from '@/pages/Investments/ValueBreakdownBar';
import type { InvestmentTotalsDto } from '@/types/Investment';
import { ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface PortfolioSummaryCardProps {
  totals: InvestmentTotalsDto;
  pricesAsOf: string | null;
  isStale: boolean;
}

const BIG_VALUE_SX = { fontSize: { xs: '2.5rem', md: '3rem' }, fontWeight: 700, lineHeight: 1.1 };
const STAT_VALUE_SX = { fontSize: '1.125rem', fontWeight: 700 };

const PortfolioSummaryCard = ({ totals, pricesAsOf, isStale }: PortfolioSummaryCardProps) => {
  const { t } = useTranslation('investments');
  const theme = useTheme();
  const { invested, value, pl, plPct } = totals;
  const profitDotColor = pl !== null && pl < 0 ? theme.palette.error.main : theme.palette.success.main;

  return (
    <Column spacing={2.5}>
      <Column spacing={1.25} alignItems="flex-start">
        <Row justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
          <Column spacing={0.25}>
            <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              {t('summary.currentValue')}
            </Typography>
            {pricesAsOf && (
              <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {t('header.subtitle', { date: dayjs(pricesAsOf).format('DD/MM/YYYY') })}
              </Typography>
            )}
            {isStale && (
              <Typography color="warning.main" sx={{ fontSize: '0.75rem' }}>
                {t('header.staleHint')}
              </Typography>
            )}
          </Column>
          <Chip label={t('header.currencyChip')} size="small" variant="outlined" />
        </Row>
        {value === null ? (
          <Typography sx={BIG_VALUE_SX}>—</Typography>
        ) : (
          <CurrencyText value={roundForDisplay(value)} {...ILS_DISPLAY} sx={BIG_VALUE_SX} />
        )}
        {pl !== null && plPct !== null && <ProfitPill pl={pl} plPct={plPct} />}
      </Column>
      {value !== null && <ValueBreakdownBar invested={invested} value={value} />}
      <Row justifyContent="space-between">
        <BreakdownStat label={t('summary.invested')} dotColor={theme.palette.primary.main}>
          <CurrencyText value={roundForDisplay(invested)} {...ILS_DISPLAY} sx={STAT_VALUE_SX} />
        </BreakdownStat>
        <BreakdownStat label={t('summary.profit')} dotColor={profitDotColor}>
          {pl === null ? (
            <Typography sx={STAT_VALUE_SX}>—</Typography>
          ) : (
            <CurrencyText
              value={roundForDisplay(pl)}
              {...ILS_DISPLAY}
              hasSign
              hasColor
              sx={STAT_VALUE_SX}
            />
          )}
        </BreakdownStat>
      </Row>
    </Column>
  );
};

export default PortfolioSummaryCard;
