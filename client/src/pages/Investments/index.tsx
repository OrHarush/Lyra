import { useTranslation } from 'react-i18next';

import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import InvestmentsPage from '@/pages/Investments/InvestmentsPage';

const Investments = () => {
  const { t } = useTranslation('investments');

  usePageHeader(t('page.title'));

  return <InvestmentsPage />;
};

export default Investments;
