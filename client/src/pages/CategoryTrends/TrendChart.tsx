import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Column from '@/components/shared/layout/containers/Column';
import TrendDot from '@/pages/CategoryTrends/TrendDot';
import TrendTooltip from '@/pages/CategoryTrends/TrendTooltip';
import { TrendChartRow } from '@/utils/entities/categoryTrends';

interface TrendChartProps {
  rows: TrendChartRow[];
  selectedPeriod: string;
  color?: string;
  onSelectMonth: (period: string) => void;
}

const MIN_CHART_HEIGHT = 260;

const TrendChart = ({ rows, selectedPeriod, color, onSelectMonth }: TrendChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation('categoryTrends');
  const lineColor = color ?? theme.palette.primary.main;
  const hasBudget = rows.some(row => row.budget !== null);

  const selectRowAtCursor = (state: { activeIndex?: string | number | null }) => {
    const row = rows[Number(state?.activeIndex)];

    if (row) {
      onSelectMonth(row.period);
    }
  };

  return (
    <Column
      sx={{
        flex: 1,
        minHeight: MIN_CHART_HEIGHT,
        height: { xs: MIN_CHART_HEIGHT, md: 'auto' },
        '& *:focus:not(:focus-visible)': { outline: 'none' },
      }}
    >
      <ResponsiveContainer width="100%" height="100%" style={{ direction: 'ltr' }}>
        <ComposedChart
          data={rows}
          margin={{ top: 16, right: 16, bottom: 0, left: 16 }}
          onClick={selectRowAtCursor}
        >
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: theme.palette.divider }} />
          <Line
            dataKey="total"
            name={t('chart.spent')}
            type="monotone"
            stroke={lineColor}
            strokeWidth={3}
            dot={<TrendDot selectedPeriod={selectedPeriod} color={lineColor} />}
            activeDot={false}
            isAnimationActive={false}
          />
          {hasBudget && (
            <Line
              dataKey="budget"
              name={t('chart.budget')}
              type="stepAfter"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          {hasBudget && <Legend iconType="plainline" />}
        </ComposedChart>
      </ResponsiveContainer>
    </Column>
  );
};

export default TrendChart;
