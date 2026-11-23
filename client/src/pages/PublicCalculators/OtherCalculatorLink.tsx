import { Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { bodyTextSx, getProseStyle, headingSx } from '@/pages/PublicCalculators/styles';

interface OtherCalculatorLinkProps {
  title: string;
  description: string;
  href: string;
}

const OtherCalculatorLink = ({ title, description, href }: OtherCalculatorLinkProps) => {
  const { t } = useTranslation('publicCalculators');

  return (
    <Column component="section" spacing={1} sx={getProseStyle()}>
      <Typography component="h2" variant="h6" sx={headingSx}>
        {t('common.otherCalculator')}
      </Typography>
      <Typography variant="body1" sx={bodyTextSx}>
        <Link href={href} sx={{ fontWeight: 600 }}>
          {title}
        </Link>
        {': '}
        {description}
      </Typography>
    </Column>
  );
};

export default OtherCalculatorLink;
