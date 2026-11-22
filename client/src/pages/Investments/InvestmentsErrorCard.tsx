import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { getInvestmentCardStyle } from '@/pages/Investments/styles';

interface InvestmentsErrorCardProps {
  onRetry: () => void;
}

const InvestmentsErrorCard = ({ onRetry }: InvestmentsErrorCardProps) => {
  const { t } = useTranslation('investments');

  return (
    <Column alignItems="center" spacing={1.5} sx={{ ...getInvestmentCardStyle(), py: 4 }}>
      <Typography sx={{ fontWeight: 600 }}>{t('error.title')}</Typography>
      <Button variant="outlined" onClick={onRetry}>
        {t('error.retry')}
      </Button>
    </Column>
  );
};

export default InvestmentsErrorCard;
