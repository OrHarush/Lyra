import type { HistoryRangeValue } from '@lyra/shared';
import { useTranslation } from 'react-i18next';

import SegmentedToggle from '@/components/shared/ui/SegmentedToggle';

interface RangeChipsProps {
  range: HistoryRangeValue;
  onChange: (range: HistoryRangeValue) => void;
}

const RANGES: HistoryRangeValue[] = ['3M', '1Y', 'ALL'];

const RangeChips = ({ range, onChange }: RangeChipsProps) => {
  const { t } = useTranslation('investments');
  const options = RANGES.map(value => ({ value, label: t(`chart.range.${value}`) }));

  return <SegmentedToggle options={options} value={range} onChange={onChange} />;
};

export default RangeChips;
