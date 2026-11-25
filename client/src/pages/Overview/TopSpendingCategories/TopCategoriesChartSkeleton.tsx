import { Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { DASHBOARD_CARD_PADDING } from '@/pages/Overview/styles';

const BAR_WIDTHS = ['85%', '55%', '40%', '28%', '18%'];
const ROW_HEIGHT = 44;

const TopCategoriesChartSkeleton = () => {
  const { t } = useTranslation('overview');

  return (
    <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ display: 'flex', minHeight: 0 }}>
      <Card
        sx={{
          height: '100%',
          width: '100%',
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
            p: DASHBOARD_CARD_PADDING,
            '&:last-child': { pb: DASHBOARD_CARD_PADDING },
          }}
        >
          <Typography
            variant="h5"
            color="text.primary"
            sx={{ mb: 4, flexShrink: 0, fontWeight: 700 }}
          >
            {t('topSpendingCategories.title')}
          </Typography>

          <Column sx={{ flex: 1, justifyContent: 'center' }}>
            {BAR_WIDTHS.map((width, i) => (
              <Row key={i} spacing={1.5} alignItems="center" dir="ltr" sx={{ height: ROW_HEIGHT }}>
                <Skeleton variant="text" width={90} sx={{ flexShrink: 0 }} />
                <Skeleton
                  variant="rounded"
                  height={ROW_HEIGHT * 0.7}
                  sx={{ width, borderRadius: '0 6px 6px 0' }}
                />
                <Skeleton variant="text" width={48} sx={{ flexShrink: 0 }} />
              </Row>
            ))}
          </Column>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TopCategoriesChartSkeleton;
