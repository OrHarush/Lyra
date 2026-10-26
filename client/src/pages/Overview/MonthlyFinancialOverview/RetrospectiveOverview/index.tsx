import { useTranslation } from 'react-i18next';

import HealthIndicatorsGrid from '@/components/features/overview/HealthIndicatorsGrid';
import Column from '@/components/shared/layout/containers/Column';
import { HealthTile } from '@/types/HealthTile';
import RetrospectiveOverviewHero from '@/pages/Overview/MonthlyFinancialOverview/RetrospectiveOverview/RetrospectiveOverviewHero';

interface RetrospectiveOverviewProps {
  income: number;
  expenses: number;
}

const formatAmount = (amount: number, language: string): string =>
  Math.round(amount).toLocaleString(language, { maximumFractionDigits: 0 });

const RetrospectiveOverview = ({ income, expenses }: RetrospectiveOverviewProps) => {
  const { t, i18n } = useTranslation('overview');
  const net = income - expenses;

  const incomeTile: HealthTile = {
    label: t('general.income'),
    value: `${formatAmount(income, i18n.language)} ₪`,
    description: '',
  };

  const expensesTile: HealthTile = {
    label: t('general.expenses'),
    value: `${formatAmount(expenses, i18n.language)} ₪`,
    description: '',
  };

  return (
    <Column spacing={2.5}>
      <RetrospectiveOverviewHero net={net} income={income} />
      <HealthIndicatorsGrid tiles={[incomeTile, expensesTile]} />
    </Column>
  );
};

export default RetrospectiveOverview;
