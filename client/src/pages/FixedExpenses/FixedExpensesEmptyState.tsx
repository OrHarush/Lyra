import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

const FixedExpensesEmptyState = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <EmptyState
      icon={EventRepeatIcon}
      title={t('empty.title')}
      description={t('empty.body')}
      action={{ label: t('add'), onClick: onAdd }}
    />
  );
};

export default FixedExpensesEmptyState;
