import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';

interface CategoryTrendsErrorProps {
  message: string;
  onRetry: () => void;
}

const CategoryTrendsError = ({ message, onRetry }: CategoryTrendsErrorProps) => {
  const { t } = useTranslation('categoryTrends');

  return (
    <Column alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 4 }}>
      <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
      <Typography variant="body2" color="error" align="center">
        {message}
      </Typography>
      <Button variant="outlined" color="error" onClick={onRetry}>
        {t('error.retry')}
      </Button>
    </Column>
  );
};

export default CategoryTrendsError;
