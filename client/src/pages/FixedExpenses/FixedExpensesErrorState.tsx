import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

const FixedExpensesErrorState = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <EmptyState
      icon={ErrorOutlineIcon}
      title={t('errors.loadFailed')}
      description=""
      action={{ label: t('errors.retry'), onClick: onRetry, variant: 'outlined' }}
      isMuted
    />
  );
};

export default FixedExpensesErrorState;
