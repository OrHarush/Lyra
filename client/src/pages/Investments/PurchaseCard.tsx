import { ButtonBase, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import FundBadge from '@/pages/Investments/FundBadge';
import PurchaseMoney from '@/pages/Investments/PurchaseMoney';
import Sparkline from '@/pages/Investments/Sparkline';
import { getPurchaseCardStyle } from '@/pages/Investments/styles';
import TrendPercent from '@/pages/Investments/TrendPercent';
import type { FundColor } from '@/theme/investmentColors';
import type { InvestmentPurchaseViewDto } from '@/types/Investment';
import { formatIsoDate, ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface PurchaseCardProps {
  purchase: InvestmentPurchaseViewDto;
  color: FundColor;
  trend: number[];
  onEdit?: (id: string) => void;
}

const SPARKLINE_HEIGHT = 40;

const PurchaseCard = ({ purchase, color, trend, onEdit }: PurchaseCardProps) => {
  const { t } = useTranslation('investments');
  const { plIls, plPctIls } = purchase;
  const hasProfit = plIls !== null && plPctIls !== null;

  return (
    <ButtonBase
      component="div"
      disabled={!onEdit}
      onClick={() => onEdit?.(purchase.id)}
      title={purchase.displayName}
      sx={getPurchaseCardStyle(Boolean(onEdit))}
    >
      <Column spacing={2} sx={{ width: '100%' }}>
        <Row justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <FundBadge label={purchase.badge} color={color} />
          <Column alignItems="flex-end">
            <Typography color="text.secondary" dir="ltr" sx={{ fontSize: '0.8125rem' }}>
              {formatIsoDate(purchase.date)}
            </Typography>
            {purchase.priceDate !== purchase.date && (
              <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                {t('purchases.priceFrom', { date: formatIsoDate(purchase.priceDate) })}
              </Typography>
            )}
          </Column>
        </Row>
        <Row justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Column spacing={0.25} alignItems="flex-start">
            <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              {t('purchases.columns.valueToday')}
            </Typography>
            <Column sx={{ fontSize: '1.875rem', fontWeight: 700, lineHeight: 1.1 }}>
              <PurchaseMoney
                ils={purchase.valueTodayIls}
                original={purchase.valueToday}
                currency={purchase.currency}
                isBold
              />
            </Column>
          </Column>
          {hasProfit && (
            <Column spacing={0.75} alignItems="flex-start">
              <CurrencyText
                value={roundForDisplay(plIls)}
                {...ILS_DISPLAY}
                hasSign
                hasColor
                sx={{ fontSize: '1.0625rem', fontWeight: 700 }}
              />
              <TrendPercent pl={plIls} plPct={plPctIls} />
            </Column>
          )}
        </Row>
        <Row spacing={0.75} alignItems="baseline">
          <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            {t('purchases.columns.invested')}
          </Typography>
          <PurchaseMoney
            ils={purchase.amountIls}
            original={purchase.amount}
            currency={purchase.currency}
            isBold
          />
        </Row>
        <Sparkline
          values={trend}
          isLoss={hasProfit ? plIls < 0 : null}
          height={SPARKLINE_HEIGHT}
        />
      </Column>
    </ButtonBase>
  );
};

export default PurchaseCard;
