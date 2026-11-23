import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/Routes';

const inlineLinkSx = {
  color: 'primary.main',
  textDecoration: 'underline',
  textDecorationColor: 'rgba(167,139,250,0.4)',
  transition: 'text-decoration-color 0.2s',
  '&:hover': { textDecorationColor: '#a78bfa' },
} as const;

const CalculatorsCrossLink = () => {
  const { t } = useTranslation('blog');

  return (
    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
      {t('calculatorsCrossLink.before')}
      <Typography component="a" href={ROUTES.CALCULATORS_NET_SALARY_URL} sx={inlineLinkSx}>
        {t('calculatorsCrossLink.netSalary')}
      </Typography>
      {t('calculatorsCrossLink.between')}
      <Typography component="a" href={ROUTES.CALCULATORS_COMPOUND_INTEREST_URL} sx={inlineLinkSx}>
        {t('calculatorsCrossLink.compoundInterest')}
      </Typography>
      {t('calculatorsCrossLink.after')}
    </Typography>
  );
};

export default CalculatorsCrossLink;
