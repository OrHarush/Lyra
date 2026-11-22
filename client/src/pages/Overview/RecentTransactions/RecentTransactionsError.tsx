import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface RecentTransactionsErrorProps {
  retry: () => void;
}

const RecentTransactionsError = ({ retry }: RecentTransactionsErrorProps) => {
  const { t } = useTranslation('overview');

  return (
    <Column alignItems="center" justifyContent="center" spacing={1.5} sx={{ flex: 1, py: 2 }}>
      <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
      <Typography variant="body2" color="error" align="center">
        {t('recentTransactions.error.message')}
      </Typography>
      <Button variant="outlined" color="error" onClick={retry}>
        {t('recentTransactions.error.retry')}
      </Button>
    </Column>
  );
};

export default RecentTransactionsError;
