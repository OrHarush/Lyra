import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import DonutRing, { DonutSegment } from '@/pages/Investments/DonutRing';
import { FundColor, OTHER_FUND_COLOR } from '@/theme/investmentColors';
import type { InvestmentFundDto } from '@/types/Investment';
import { formatWholePercent, ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface AllocationDonutProps {
  funds: InvestmentFundDto[];
  colors: Map<string, FundColor>;
}

interface AllocationRow {
  key: string;
  label: string;
  color: string;
  value: number;
  share: number;
}

const OTHER_KEY = '__other__';
const DONUT_SIZE = 96;
const DONUT_STROKE_WIDTH = 10;

const toRows = (funds: InvestmentFundDto[], colors: Map<string, FundColor>, otherLabel: string) => {
  const priced = funds.filter(fund => fund.valueIls !== null && fund.allocationPct !== null);
  const named = priced.filter(fund => colors.get(fund.yahooSymbol) !== OTHER_FUND_COLOR);
  const rest = priced.filter(fund => colors.get(fund.yahooSymbol) === OTHER_FUND_COLOR);

  const rows: AllocationRow[] = named.map(fund => ({
    key: fund.yahooSymbol,
    label: fund.badge,
    color: colors.get(fund.yahooSymbol)?.main ?? OTHER_FUND_COLOR.main,
    value: fund.valueIls as number,
    share: fund.allocationPct as number,
  }));

  if (rest.length > 0) {
    rows.push({
      key: OTHER_KEY,
      label: otherLabel,
      color: OTHER_FUND_COLOR.main,
      value: rest.reduce((sum, fund) => sum + (fund.valueIls as number), 0),
      share: rest.reduce((sum, fund) => sum + (fund.allocationPct as number), 0),
    });
  }

  return rows;
};

const AllocationDonut = ({ funds, colors }: AllocationDonutProps) => {
  const { t } = useTranslation('investments');
  const rows = toRows(funds, colors, t('allocation.other'));
  const segments: DonutSegment[] = rows.map(row => ({
    key: row.key,
    value: row.value,
    color: row.color,
  }));

  return (
    <Column spacing={2}>
      <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
        {t('allocation.title')}
      </Typography>
      <Row spacing={2} alignItems="center" justifyContent="space-between">
        <Column spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
          {rows.map(row => (
            <Column key={row.key} spacing={0.25}>
              <Row spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography
                  component="span"
                  sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color, flexShrink: 0 }}
                />
                <Typography noWrap dir="ltr" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {row.label}
                </Typography>
              </Row>
              <Row spacing={0.5} alignItems="baseline" dir="ltr">
                <Typography color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {`${formatWholePercent(row.share)} ·`}
                </Typography>
                <CurrencyText
                  value={roundForDisplay(row.value)}
                  {...ILS_DISPLAY}
                  color="text.secondary"
                  sx={{ fontSize: '0.8125rem' }}
                />
              </Row>
            </Column>
          ))}
        </Column>
        <DonutRing segments={segments} size={DONUT_SIZE} strokeWidth={DONUT_STROKE_WIDTH}>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, lineHeight: 1 }}>
            {funds.length}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
            {t('allocation.funds', { count: funds.length })}
          </Typography>
        </DonutRing>
      </Row>
    </Column>
  );
};

export default AllocationDonut;
