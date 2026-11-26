import { useTranslation } from 'react-i18next';

import { countDaysUntil } from '@/utils/entities/fixedExpense';

export const useRelativeChargeLabel = () => {
  const { t } = useTranslation('fixedExpenses');

  return (isoDate: string) => {
    const days = countDaysUntil(isoDate);

    if (days <= 0) {
      return t('when.today');
    }

    if (days === 1) {
      return t('when.tomorrow');
    }

    return t('when.inDays', { count: days });
  };
};
