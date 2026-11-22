import AddIcon from '@mui/icons-material/Add';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface RecentTransactionsEmptyProps {
  onAddTransaction: () => void;
}

const RecentTransactionsEmpty = ({ onAddTransaction }: RecentTransactionsEmptyProps) => {
  const { t } = useTranslation('overview');

  return (
    <Column alignItems="center" justifyContent="center" spacing={1.5} sx={{ flex: 1, py: 2 }}>
      <ReceiptLongIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.6 }} />
      <Typography variant="subtitle1" fontWeight={600} align="center">
        {t('recentTransactions.empty.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        {t('recentTransactions.empty.body')}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddTransaction}>
        {t('recentTransactions.addTransaction')}
      </Button>
    </Column>
  );
};

export default RecentTransactionsEmpty;
