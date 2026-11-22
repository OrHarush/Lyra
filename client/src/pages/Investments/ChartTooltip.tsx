import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import type { ChartPurchase } from '@/pages/Investments/chartModel';
import type { InvestmentHistoryPointDto } from '@/types/Investment';
import { formatShortDate, ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface ChartTooltipProps {
  point: InvestmentHistoryPointDto | undefined;
  purchases: ChartPurchase[];
  locale: string;
}

const ChartTooltip = ({ point, purchases, locale }: ChartTooltipProps) => {
  const { t } = useTranslation('investments');

  if (!point) {
    return null;
  }

  return (
    <Column
      spacing={0.5}
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 1.25,
        boxShadow: 3,
      }}
    >
      <Typography color="text.secondary" sx={{ fontSize: '0.75rem' }}>
        {formatShortDate(point.date, locale)}
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem' }}>
        {t('chart.tooltipValue')}{' '}
        <CurrencyText value={roundForDisplay(point.value)} {...ILS_DISPLAY} sx={{ fontWeight: 700 }} />
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem' }}>
        {t('chart.tooltipInvested')}{' '}
        <CurrencyText value={roundForDisplay(point.invested)} {...ILS_DISPLAY} />
      </Typography>
      {purchases.map(purchase => (
        <Typography key={purchase.id} dir="ltr" sx={{ fontSize: '0.75rem' }}>
          {`${formatShortDate(purchase.date, locale)} · ${purchase.badge} · `}
          <CurrencyText value={roundForDisplay(purchase.amountIls)} {...ILS_DISPLAY} />
          {purchase.valueTodayIls !== null && (
            <>
              {' → '}
              <CurrencyText value={roundForDisplay(purchase.valueTodayIls)} {...ILS_DISPLAY} />
            </>
          )}
        </Typography>
      ))}
    </Column>
  );
};

export default ChartTooltip;
