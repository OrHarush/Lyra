import { useTranslation } from 'react-i18next';

import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import FixedExpensesPage from '@/pages/FixedExpenses/FixedExpensesPage';

const FixedExpenses = () => {
  const { t } = useTranslation('fixedExpenses');

  usePageHeader(t('page.title'));

  return <FixedExpensesPage />;
};

export default FixedExpenses;
