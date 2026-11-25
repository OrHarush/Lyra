import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { TrendSort } from '@/utils/entities/categoryTrends';

interface SortToggleProps {
  value: TrendSort;
  onChange: (sort: TrendSort) => void;
}

const SortToggle = ({ value, onChange }: SortToggleProps) => {
  const { t } = useTranslation('categoryTrends');

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      aria-label={t('transactions.sortLabel')}
      onChange={(_, next: TrendSort | null) => next && onChange(next)}
    >
      <ToggleButton value="amount" sx={{ px: 1.5, textTransform: 'none' }}>
        {t('transactions.sortAmount')}
      </ToggleButton>
      <ToggleButton value="date" sx={{ px: 1.5, textTransform: 'none' }}>
        {t('transactions.sortDate')}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default SortToggle;
