import { Card, Divider, Grid, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useIsMobile } from '@/hooks/common/useIsMobile';
import IncomeUsageMeterSkeleton from '@/pages/Overview/MonthlyFinancialOverview/IncomeUsageMeterSkeleton';

const MonthlyFinancialOverviewSkeleton = () => {
  const { t } = useTranslation('overview');
  const isMobile = useIsMobile();

  return (
    <Grid size={{ xs: 12, md: 6, lg: 5, xl: 4 }}>
      <Card sx={{ p: 3, height: '100%' }}>
        <Column spacing={2}>
          <Skeleton
            variant="rectangular"
            sx={{ alignSelf: isMobile ? 'center' : 'start', borderRadius: '8px' }}
            width={200}
            height={40}
          />
          <Row spacing={1} alignItems="center" justifyContent="space-evenly" height={'52px'}>
            <Column alignItems={'center'} minWidth={'120px'}>
              <Skeleton variant="text" width={100} height={40} />
              <Typography variant="body2" color="text.secondary">
                {t('general.balance')}
              </Typography>
            </Column>
            <Divider orientation="vertical" flexItem />
            <Column alignItems={'center'} minWidth={'120px'}>
              <Skeleton variant="text" width={100} height={40} />
              <Typography variant="body2" color="text.secondary">
                {t('general.projectedBalance')}
              </Typography>
            </Column>
          </Row>
          <Column spacing={1}>
            <Row spacing={2} justifyContent="space-evenly">
              <Row alignItems="center" spacing={1}>
                <Skeleton
                  variant="rounded"
                  width={40}
                  height={40}
                  sx={{ borderRadius: '12px', minWidth: 40, minHeight: 40 }}
                />
                <Column>
                  <Typography fontWeight={600}>₪—</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('general.income')}
                  </Typography>
                </Column>
              </Row>
              <Row alignItems="center" spacing={1}>
                <Skeleton
                  variant="rounded"
                  width={40}
                  height={40}
                  sx={{ borderRadius: '12px', minWidth: 40, minHeight: 40 }}
                />
                <Column>
                  <Typography fontWeight={600}>₪—</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('general.expenses')}
                  </Typography>
                </Column>
              </Row>
              {!isMobile && (
                <Row alignItems="center" spacing={1}>
                  <Skeleton
                    variant="rounded"
                    width={40}
                    height={40}
                    sx={{ borderRadius: '12px', minWidth: 40, minHeight: 40 }}
                  />
                  <Column>
                    <Typography fontWeight={600}>₪—</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('general.net')}
                    </Typography>
                  </Column>
                </Row>
              )}
            </Row>
            <IncomeUsageMeterSkeleton />
          </Column>
        </Column>
      </Card>
    </Grid>
  );
};

export default MonthlyFinancialOverviewSkeleton;
