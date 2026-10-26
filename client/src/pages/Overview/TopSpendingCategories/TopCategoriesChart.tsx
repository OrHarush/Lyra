import { DefaultCategoryKey } from '@lyra/shared';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { useIsMobile } from '@/hooks/common/useIsMobile';
import { useCategoryName } from '@/hooks/entities/useCategoryName';
import BarValueLabel from '@/pages/Overview/TopSpendingCategories/BarValueLabel';
import CategoryAxisTick from '@/pages/Overview/TopSpendingCategories/CategoryAxisTick';

interface TopCategoriesContentProps {
  chartData: {
    id: string;
    key?: DefaultCategoryKey;
    name: string;
    amount: number;
    color: string | undefined;
  }[];
  isLoading?: boolean;
  onBarClick?: (categoryId: string) => void;
}

interface BarClickPayload {
  id: string;
}

const ROW_HEIGHT = 44;

const TopCategoriesChart = ({ chartData, isLoading, onBarClick }: TopCategoriesContentProps) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const { t } = useTranslation('overview');
  const getCategoryName = useCategoryName();

  const handleBarClick = (payload: BarClickPayload) => {
    if (!onBarClick) {
      return;
    }

    onBarClick(payload.id);
  };

  const dataset = [...chartData]
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({
      id: item.id,
      name: getCategoryName(item as any),
      amount: item.amount,
      color: item.color ?? theme.palette.grey[500],
    }));

  const chartHeight = dataset.length * ROW_HEIGHT;

  return (
    <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex', minHeight: 0 }}>
      <Card
        sx={{
          height: '100%',
          width: '100%',
          p: isMobile ? 1 : 2,
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            position: 'relative',
            '&:last-child': { pb: 2 },
          }}
        >
          <Typography
            variant="h5"
            color="text.primary"
            align={isMobile ? 'center' : undefined}
            sx={{ mb: 2.5, flexShrink: 0 }}
          >
            {t('topSpendingCategories.title')}
          </Typography>
          <Box
            sx={{
              flex: 1,
              minHeight: chartHeight,
              display: 'flex',
              alignItems: 'center',
              '& *:focus:not(:focus-visible)': { outline: 'none' },
            }}
          >
            <ResponsiveContainer width="100%" height={'100%'} style={{ direction: 'ltr' }}>
              <BarChart
                layout="vertical"
                data={dataset}
                margin={{ top: 0, right: 72, bottom: 0, left: 8 }}
                barCategoryGap="30%"
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={<CategoryAxisTick colors={dataset.map(entry => entry.color)} />}
                  axisLine={false}
                  tickLine={false}
                />
                <Bar
                  dataKey="amount"
                  fill={theme.palette.primary.main}
                  radius={[0, 6, 6, 0]}
                  activeBar={false}
                  onClick={onBarClick ? handleBarClick : undefined}
                  style={onBarClick ? { cursor: 'pointer' } : undefined}
                >
                  <LabelList dataKey="amount" content={<BarValueLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          {isLoading && (
            <Fade in={isLoading}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(2px)',
                  bgcolor: 'rgba(0,0,0,0.15)',
                  borderRadius: 2,
                }}
              >
                <CircularProgress size={36} thickness={4} />
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TopCategoriesChart;
