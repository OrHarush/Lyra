import { TransactionFormValues } from '@lyra/shared';
import { Collapse } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import FixedExpenseKindFields from '@/components/features/fixedExpenses/FixedExpenseKindFields';
import { getKindSectionStyle } from '@/components/features/fixedExpenses/styles';
import Column from '@/components/shared/layout/containers/Column';

const FixedExpenseSection = () => {
  const { control } = useFormContext<TransactionFormValues>();
  const recurrence = useWatch({ control, name: 'recurrence' });
  const type = useWatch({ control, name: 'type' });

  const isShown = type === 'Expense' && recurrence !== 'None';

  return (
    <Collapse in={isShown} unmountOnExit>
      <Column sx={getKindSectionStyle()}>
        <FixedExpenseKindFields isNewExpense />
      </Column>
    </Collapse>
  );
};

export default FixedExpenseSection;
