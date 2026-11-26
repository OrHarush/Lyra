import { TransactionFormValues } from '@lyra/shared';
import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const EstimatedAmountHint = () => {
  const { t } = useTranslation('transactions');
  const { control } = useFormContext<TransactionFormValues>();
  const [kind, recurrence, type] = useWatch({ control, name: ['kind', 'recurrence', 'type'] });

  if (kind !== 'bill' || recurrence === 'None' || type !== 'Expense') {
    return null;
  }

  return (
    <Typography variant="caption" color="text.secondary" textAlign="center">
      {t('fixedExpense.estimatedAmountHint')}
    </Typography>
  );
};

export default EstimatedAmountHint;
