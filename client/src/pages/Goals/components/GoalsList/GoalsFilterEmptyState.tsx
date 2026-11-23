import type { GoalStatusValue } from '@lyra/shared';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

interface GoalsFilterEmptyStateProps {
  status: GoalStatusValue;
  onBackToActive: () => void;
}

const GoalsFilterEmptyState = ({ status, onBackToActive }: GoalsFilterEmptyStateProps) => {
  const { t } = useTranslation('goals');

  return (
    <EmptyState
      icon={TrackChangesIcon}
      isMuted
      title={t(`emptyFilter.${status}.headline`)}
      description={t(`emptyFilter.${status}.body`)}
      action={{ label: t('emptyFilter.backToActive'), onClick: onBackToActive, variant: 'outlined' }}
    />
  );
};

export default GoalsFilterEmptyState;
