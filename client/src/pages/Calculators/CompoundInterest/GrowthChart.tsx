import type { CompoundInterestYearPoint } from '@lyra/shared';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency } from '@/utils/currency';

interface GrowthChartProps {
  points: CompoundInterestYearPoint[];
}

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const GrowthChart = ({ points }: GrowthChartProps) => {
  const { t } = useTranslation('calculators');
  const theme = useTheme();
  const { user } = useAuth();
  const currency = user?.displayCurrency ?? 'ILS';

  const formatTooltipValue = (value: unknown) =>
    typeof value === 'number' ? formatCurrency(value, currency) : '';

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          {t('compoundInterest.chartTitle')}
        </Typography>
        <Box sx={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%" style={{ direction: 'ltr' }}>
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={value => compactNumberFormatter.format(value as number)}
                width={48}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={year => t('compoundInterest.yearLabel', { year })}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="deposited"
                stackId="balance"
                name={t('compoundInterest.chartDeposited')}
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={0.35}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="balance"
                name={t('compoundInterest.chartInterest')}
                stroke={theme.palette.success.main}
                fill={theme.palette.success.main}
                fillOpacity={0.35}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
