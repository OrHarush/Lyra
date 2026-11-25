import { useTranslation } from 'react-i18next';

import SegmentedToggle from '@/components/shared/ui/SegmentedToggle';
import { TrendSort } from '@/utils/entities/categoryTrends';

interface SortToggleProps {
  value: TrendSort;
  onChange: (sort: TrendSort) => void;
}

const SortToggle = ({ value, onChange }: SortToggleProps) => {
  const { t } = useTranslation('categoryTrends');
  const options: { value: TrendSort; label: string }[] = [
    { value: 'amount', label: t('transactions.sortAmount') },
    { value: 'date', label: t('transactions.sortDate') },
  ];

  return (
    <SegmentedToggle
      options={options}
      value={value}
      onChange={onChange}
      ariaLabel={t('transactions.sortLabel')}
    />
  );
};

export default SortToggle;
