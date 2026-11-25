import CategoryIcon from '@mui/icons-material/Category';
import { Card, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import EntityEmpty from '@/components/entities/EntityEmpty';
import Column from '@/components/shared/layout/containers/Column';
import { DASHBOARD_CARD_PADDING } from '@/pages/Overview/styles';

const EmptyCategoriesChart = () => {
  const { t } = useTranslation('overview');

  return (
    <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ display: 'flex', minHeight: 0 }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          minHeight: { xs: 320, sm: 360, md: 0 },
          flex: 1,
        }}
      >
        <Column height={'100%'} width={'100%'} sx={{ p: DASHBOARD_CARD_PADDING }} justifyContent={'center'}>
          <Typography variant="h6" gutterBottom>
            {t('topSpendingCategories.title')}
          </Typography>
          <EntityEmpty entityName={'transactions'} icon={CategoryIcon} />
        </Column>
      </Card>
    </Grid>
  );
};

export default EmptyCategoriesChart;
