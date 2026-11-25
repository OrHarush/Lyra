import { useTranslation } from 'react-i18next';

import TrendChip from '@/components/shared/ui/TrendChip';

interface BudgetChangeBadgeProps {
  usageChange: number;
}

const BudgetChangeBadge = ({ usageChange }: BudgetChangeBadgeProps) => {
  const { t } = useTranslation('budgets');

  const isIncrease = usageChange > 0;
  const sign = isIncrease ? '+' : '';

  return (
    <TrendChip
      direction={isIncrease ? 'up' : 'down'}
      label={`${sign}${usageChange}%`}
      tooltip={t('vsLastMonth')}
    />
  );
};

export default BudgetChangeBadge;
