import SavingsIcon from '@mui/icons-material/Savings';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

interface BudgetsEmptyStateProps {
  onCreateBudget: () => void;
}

const BudgetsEmptyState = ({ onCreateBudget }: BudgetsEmptyStateProps) => {
  const { t } = useTranslation('budgets');

  return (
    <EmptyState
      icon={SavingsIcon}
      title={t('empty.title')}
      description={t('empty.subtitle')}
      action={{ label: t('createBudget'), onClick: onCreateBudget }}
    />
  );
};

export default BudgetsEmptyState;
