import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';

// On larger screens the nav bar already shows the page title.
const FixedExpensesIntro = () => {
  const { t } = useTranslation('fixedExpenses');
  const isSmallScreen = useIsSmallScreen();

  return (
    <Column spacing={0.5}>
      {isSmallScreen && (
        <Typography variant="h5" fontWeight={800}>
          {t('page.title')}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary">
        {t('page.subtitle')}
      </Typography>
    </Column>
  );
};

export default FixedExpensesIntro;
