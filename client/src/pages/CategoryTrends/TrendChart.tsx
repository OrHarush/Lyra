import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import Column from '@/components/shared/layout/containers/Column';
import TrendTooltip from '@/pages/CategoryTrends/TrendTooltip';
import { TrendChartRow } from '@/utils/entities/categoryTrends';

interface TrendChartProps {
  rows: TrendChartRow[];
  selectedPeriod: string;
  color?: string;
  onSelectMonth: (period: string) => void;
}

const MIN_CHART_HEIGHT = 260;
const UNSELECTED_OPACITY = 0.4;

const TrendChart = ({ rows, selectedPeriod, color, onSelectMonth }: TrendChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation('categoryTrends');
  const barColor = color ?? theme.palette.primary.main;
  const hasBudget = rows.some(row => row.budget !== null);

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
        <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
          />
          <YAxis hide />
          <Tooltip content={<TrendTooltip />} cursor={false} />
          <Bar
            dataKey="total"
            name={t('chart.spent')}
            radius={[6, 6, 0, 0]}
            style={{ cursor: 'pointer' }}
            onClick={(bar: { payload?: TrendChartRow }) => {
              if (bar.payload) {
                onSelectMonth(bar.payload.period);
              }
            }}
          >
            {rows.map(row => (
              <Cell
                key={row.period}
                fill={barColor}
                fillOpacity={row.period === selectedPeriod ? 1 : UNSELECTED_OPACITY}
              />
            ))}
          </Bar>
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
