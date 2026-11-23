import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { bodyTextSx, getH1Style, getProseStyle } from '@/pages/PublicCalculators/styles';

interface CalculatorIntroProps {
  title: string;
  answer: string;
  ratesLabel?: string;
}

const CalculatorIntro = ({ title, answer, ratesLabel }: CalculatorIntroProps) => {
  const { t } = useTranslation('publicCalculators');

  return (
    <Column spacing={1.5} sx={getProseStyle()}>
      <Typography component="h1" variant="h3" sx={getH1Style()}>
        {title}
      </Typography>
      {ratesLabel && (
        <Typography variant="caption" color="text.secondary">
          {ratesLabel}
        </Typography>
      )}
      <Typography variant="body1" sx={bodyTextSx}>
        {answer}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t('common.privacyNote')}
      </Typography>
    </Column>
  );
};

export default CalculatorIntro;
