import { useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ChartEndCallout from '@/pages/Investments/ChartEndCallout';
import { getDotRadius, groupPurchasesBySeriesDate } from '@/pages/Investments/chartModel';
import ChartTooltip from '@/pages/Investments/ChartTooltip';
import InvestedTag from '@/pages/Investments/InvestedTag';
import PurchaseDots from '@/pages/Investments/PurchaseDots';
import type { FundColor } from '@/theme/investmentColors';
import type { InvestmentHistoryDto, InvestmentPurchaseViewDto } from '@/types/Investment';
import { formatCurrency } from '@/utils/currency';
import {
  formatMonthLabel,
  formatMonthYearLabel,
  formatShortDate,
  roundForDisplay,
} from '@/utils/investmentFormat';

interface PortfolioChartBodyProps {
  history: InvestmentHistoryDto;
  purchaseViews: InvestmentPurchaseViewDto[];
  colors: Map<string, FundColor>;
  height: number;
}

const SLATE = '#94a3b8';
const MIN_TICK_GAP = 48;
const Y_AXIS_WIDTH = 48;
const Y_AXIS_TICK_COUNT = 5;

const PortfolioChartBody = ({ history, purchaseViews, colors, height }: PortfolioChartBodyProps) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('investments');
  const locale = i18n.language;
  const purchasesByDate = useMemo(
    () => groupPurchasesBySeriesDate(history.series, history.purchases, purchaseViews),
    [history, purchaseViews]
  );
  const dotRadius = getDotRadius(history.purchases.length);
  const crossesYears = history.series[0].date.slice(0, 4) !== history.series.at(-1)?.date.slice(0, 4);
  const formatTick = crossesYears ? formatMonthYearLabel : formatMonthLabel;
  const lastPoint = history.series[history.series.length - 1];
  const formatAmount = (amount: number) => formatCurrency(roundForDisplay(amount), 'ILS');
  const formatAxisAmount = (amount: number) => Math.round(amount).toLocaleString(locale);
  const mutedColor = theme.palette.text.secondary;

  return (
    <div dir="ltr" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={history.series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={SLATE} strokeOpacity={0.15} />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) => formatTick(date, locale)}
            minTickGap={MIN_TICK_GAP}
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
          />
          <YAxis
            width={Y_AXIS_WIDTH}
            domain={['auto', 'auto']}
            tickCount={Y_AXIS_TICK_COUNT}
            tickFormatter={formatAxisAmount}
            tickLine={false}
            axisLine={false}
            tick={{ fill: mutedColor, fontSize: 11 }}
          />
          <Tooltip
            content={({ active, label }) =>
              active ? (
                <ChartTooltip
                  point={history.series.find(point => point.date === label)}
                  purchases={purchasesByDate.get(String(label)) ?? []}
                  locale={locale}
                />
              ) : null
            }
          />
          <Area
            dataKey="value"
            type="monotone"
            stroke={theme.palette.primary.main}
            strokeWidth={2.5}
            fill={theme.palette.primary.main}
            fillOpacity={0.1}
            dot={dotProps =>
              dotProps.payload.date === lastPoint.date ? (
                <ChartEndCallout
                  key={dotProps.key}
                  cx={dotProps.cx}
                  cy={dotProps.cy}
                  valueLabel={formatAmount(lastPoint.value)}
                  dateLabel={`${formatShortDate(lastPoint.date, locale)} ${lastPoint.date.slice(0, 4)}`}
                  chartHeight={height}
                  pointColor={theme.palette.primary.main}
                  ringColor={theme.palette.background.paper}
                  textColor={theme.palette.text.primary}
                  mutedColor={mutedColor}
                  borderColor={theme.palette.divider}
                />
              ) : (
                <g key={dotProps.key} />
              )
            }
            isAnimationActive={false}
          />
          <Line
            dataKey="invested"
            type="stepAfter"
            stroke={SLATE}
            strokeWidth={2}
            strokeDasharray="5 4"
            isAnimationActive={false}
            dot={dotProps => (
              <PurchaseDots
                key={dotProps.key}
                cx={dotProps.cx}
                cy={dotProps.cy}
                purchases={purchasesByDate.get(dotProps.payload.date) ?? []}
                colors={colors}
                radius={dotRadius}
                ringColor={theme.palette.background.paper}
              />
            )}
            label={labelProps =>
              labelProps.index === history.series.length - 1 ? (
                <InvestedTag
                  key={labelProps.index}
                  x={labelProps.x as number}
                  y={labelProps.y as number}
                  label={`${formatAmount(lastPoint.invested)} · ${t('chart.investedTag')}`}
                  backgroundColor={theme.palette.background.paper}
                  textColor={mutedColor}
                  borderColor={theme.palette.divider}
                />
              ) : (
                <g key={labelProps.index} />
              )
            }
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChartBody;
