import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

const FixedExpensesIntro = () => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <Column spacing={0.5}>
      <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
        {t('page.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('page.subtitle')}
      </Typography>
    </Column>
  );
};

export default FixedExpensesIntro;
