import { useTranslation } from 'react-i18next';

import { PendingBillDto } from '@/types/Bill';

export const useBillTitle = ({ name, billType }: Pick<PendingBillDto, 'name' | 'billType'>) => {
  const { t } = useTranslation('bills');

  if (billType && billType !== 'other') {
    return t(`titles.${billType}`);
  }

  return name || t('titles.other');
};
