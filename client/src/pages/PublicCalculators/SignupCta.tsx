import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CtaButton from '@/pages/Home/HeroSection/HeroContent/CtaButton';
import { bodyTextSx } from '@/pages/PublicCalculators/styles';

const SignupCta = () => {
  const { t } = useTranslation('publicCalculators');

  return (
    <Column component="section" alignItems="center" spacing={2} sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="body1" sx={{ ...bodyTextSx, textAlign: 'center' }}>
        {t('common.ctaLine')}
      </Typography>
      <CtaButton labelKey="ctaBottom" />
    </Column>
  );
};

export default SignupCta;
