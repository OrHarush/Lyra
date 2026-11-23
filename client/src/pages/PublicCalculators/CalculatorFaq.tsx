import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import FaqAccordion from '@/pages/Home/FaqSection/FaqAccordion';
import { FaqItem } from '@/pages/PublicCalculators/buildCalculatorSchemas';
import { getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface CalculatorFaqProps {
  items: FaqItem[];
}

const CalculatorFaq = ({ items }: CalculatorFaqProps) => {
  const { t } = useTranslation('publicCalculators');

  return (
    <Column component="section" spacing={1.5} sx={getProseStyle()}>
      <Typography component="h2" variant="h5" sx={headingSx}>
        {t('common.faqTitle')}
      </Typography>
      {items.map(item => (
        <FaqAccordion key={item.q} question={item.q} answer={item.a} />
      ))}
    </Column>
  );
};

export default CalculatorFaq;
