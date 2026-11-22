import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import { TransactionTypeFilter } from '@/types/Transaction';

const TYPE_OPTIONS: { value: TransactionTypeFilter; labelKey: string }[] = [
  { value: 'All', labelKey: 'typeToggle.all' },
  { value: 'Income', labelKey: 'typeToggle.income' },
  { value: 'Expense', labelKey: 'typeToggle.expenses' },
];

const TransactionTypeToggle = () => {
  const { t } = useTranslation('transactions');
  const { selectedType, setSelectedType } = useTransactionPageData();

  const changeType = (_: MouseEvent<HTMLElement>, next: TransactionTypeFilter | null) => {
    if (next) {
      setSelectedType(next);
    }
  };

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={selectedType}
      onChange={changeType}
      aria-label={t('typeToggle.label')}
      sx={{
        borderRadius: '999px',
        '& .MuiToggleButton-root': { borderRadius: '999px', border: 0, px: 2 },
        backgroundColor: 'action.hover',
        p: 0.5,
      }}
    >
      {TYPE_OPTIONS.map(({ value, labelKey }) => (
        <ToggleButton
          key={value}
          value={value}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          {t(labelKey)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default TransactionTypeToggle;
