import { useTranslation } from 'react-i18next';

import SegmentedToggle from '@/components/shared/ui/SegmentedToggle';
import { RANGE_OPTIONS, TrendRange } from '@/utils/entities/categoryTrends';

interface RangeSwitchProps {
  value: TrendRange;
  onChange: (range: TrendRange) => void;
}

const RangeSwitch = ({ value, onChange }: RangeSwitchProps) => {
  const { t } = useTranslation('categoryTrends');
  const options = RANGE_OPTIONS.map(option => ({
    value: option,
    label: t('range.option', { count: option }),
  }));

  return (
    <SegmentedToggle
      options={options}
      value={value}
      onChange={onChange}
      ariaLabel={t('range.label')}
    />
  );
};

export default RangeSwitch;
