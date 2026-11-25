import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { RANGE_OPTIONS, TrendRange } from '@/utils/entities/categoryTrends';

interface RangeSwitchProps {
  value: TrendRange;
  onChange: (range: TrendRange) => void;
}

const RangeSwitch = ({ value, onChange }: RangeSwitchProps) => {
  const { t } = useTranslation('categoryTrends');

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      aria-label={t('range.label')}
      onChange={(_, next: TrendRange | null) => next && onChange(next)}
    >
      {RANGE_OPTIONS.map(option => (
        <ToggleButton key={option} value={option} sx={{ px: 1.5, textTransform: 'none' }}>
          {t('range.option', { count: option })}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default RangeSwitch;
