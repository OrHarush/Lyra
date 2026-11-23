import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

interface GoalsEmptyStateProps {
  onCreate: () => void;
}

const GoalsEmptyState = ({ onCreate }: GoalsEmptyStateProps) => {
  const { t } = useTranslation('goals');

  return (
    <EmptyState
      icon={TrackChangesIcon}
      title={t('empty.headline')}
      description={t('empty.body')}
      action={{ label: t('empty.cta'), onClick: onCreate }}
    />
  );
};

export default GoalsEmptyState;
