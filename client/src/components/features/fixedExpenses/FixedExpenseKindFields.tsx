import { FIXED_EXPENSE_KINDS, FixedExpenseDetailsDTO } from '@lyra/shared';
import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import BillTypePicker from '@/components/features/fixedExpenses/BillTypePicker';
import SubscriptionProviderPicker from '@/components/features/fixedExpenses/SubscriptionProviderPicker';
import RHFToggleGroup from '@/components/shared/inputs/RHFToggleGroup';
import Column from '@/components/shared/layout/containers/Column';

interface FixedExpenseKindFieldsProps {
  canFillName?: boolean;
}

const FixedExpenseKindFields = ({ canFillName = false }: FixedExpenseKindFieldsProps) => {
  const { t } = useTranslation('transactions');
  const { control } = useFormContext<FixedExpenseDetailsDTO>();
  const kind = useWatch({ control, name: 'kind' }) ?? 'regular';

  return (
    <Column spacing={1.5}>
      <RHFToggleGroup
        name="kind"
        label={t('fixedExpense.question')}
        defaultValue="regular"
        options={FIXED_EXPENSE_KINDS.map(value => ({ value, label: t(`fixedExpense.kinds.${value}`) }))}
      />
      <Typography variant="body2" color="text.secondary">
        {t(`fixedExpense.kindHints.${kind}`)}
      </Typography>
      {kind === 'subscription' && <SubscriptionProviderPicker canFillName={canFillName} />}
      {kind === 'bill' && <BillTypePicker />}
    </Column>
  );
};

export default FixedExpenseKindFields;
