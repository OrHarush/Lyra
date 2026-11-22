import { Card, CardContent, Grid, LinearProgress, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const CategoriesBudgetSkeleton = () => {
  const { t } = useTranslation('overview');

  return (
    <Grid size={{ xs: 12, md: 6, lg: 4 }}>
      <Card sx={{ height: '100%', p: 2 }}>
        <CardContent sx={{ height: '100%' }}>
          <Column spacing={2}>
            <Typography variant="h5" color="text.secondary">
              {t('budgetWatch.title')}
            </Typography>
            {[1, 2, 3].map(i => (
              <Column key={i} spacing={0.5}>
                <Row spacing={1} alignItems="center">
                  <Skeleton variant="circular" width={20} height={20} />
                  <Skeleton variant="text" width={80} height={20} />
                </Row>
                <Column>
                  <Row justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      ₪— / ₪—
                    </Typography>
                    <Typography variant="caption" fontWeight={700}>
                      —%
                    </Typography>
                  </Row>
                  <LinearProgress
                    variant="determinate"
                    value={0}
                    sx={{
                      height: 10,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.08)',
                    }}
                  />
                </Column>
              </Column>
            ))}
          </Column>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default CategoriesBudgetSkeleton;
