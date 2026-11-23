import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useTranslation } from 'react-i18next';

import EmptyState from '@/components/shared/ui/EmptyState';

interface InvestmentsEmptyStateProps {
  onAddPurchase: () => void;
}

const InvestmentsEmptyState = ({ onAddPurchase }: InvestmentsEmptyStateProps) => {
  const { t } = useTranslation('investments');

  return (
    <EmptyState
      icon={ShowChartIcon}
      title={t('empty.title')}
      description={t('empty.body')}
      action={{ label: t('empty.cta'), onClick: onAddPurchase }}
    />
  );
};

export default InvestmentsEmptyState;
