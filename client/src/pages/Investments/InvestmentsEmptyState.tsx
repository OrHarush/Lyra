import AddIcon from '@mui/icons-material/Add';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { getInvestmentCardStyle } from '@/pages/Investments/styles';

interface InvestmentsEmptyStateProps {
  onAddPurchase: () => void;
}

const InvestmentsEmptyState = ({ onAddPurchase }: InvestmentsEmptyStateProps) => {
  const { t } = useTranslation('investments');

  return (
    <Column
      alignItems="center"
      spacing={2}
      sx={{ ...getInvestmentCardStyle(), py: 5, textAlign: 'center' }}
    >
      <ShowChartIcon sx={{ fontSize: 56, color: 'primary.main' }} />
      <Typography sx={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('empty.title')}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        {t('empty.body')}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddPurchase}>
        {t('empty.cta')}
      </Button>
    </Column>
  );
};

export default InvestmentsEmptyState;
