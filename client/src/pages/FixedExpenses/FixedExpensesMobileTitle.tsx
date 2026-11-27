import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';

// The mobile nav bar shows no page title, so only small screens need one here.
const FixedExpensesMobileTitle = () => {
  const { t } = useTranslation('fixedExpenses');
  const isSmallScreen = useIsSmallScreen();

  if (!isSmallScreen) {
    return null;
  }

  return (
    <Typography variant="h5" fontWeight={700}>
      {t('page.title')}
    </Typography>
  );
};

export default FixedExpensesMobileTitle;
