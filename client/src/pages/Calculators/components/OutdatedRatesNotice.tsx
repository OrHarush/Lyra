import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useRatesFreshness } from '@/hooks/common/useRatesFreshness';

const OutdatedRatesNotice = () => {
  const { t } = useTranslation('calculators');
  const { isCurrent, ratesYear } = useRatesFreshness();

  if (isCurrent) {
    return null;
  }

  return (
    <Alert severity="warning" sx={{ borderRadius: 2 }}>
      {t('outdatedRates', { year: ratesYear })}
    </Alert>
  );
};

export default OutdatedRatesNotice;
