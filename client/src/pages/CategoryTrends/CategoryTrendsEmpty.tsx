import InsightsIcon from '@mui/icons-material/Insights';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

const CategoryTrendsEmpty = () => {
  const { t } = useTranslation('categoryTrends');

  return (
    <EmptyState
      icon={InsightsIcon}
      title={t('empty.title')}
      description={t('empty.description')}
    />
  );
};

export default CategoryTrendsEmpty;
