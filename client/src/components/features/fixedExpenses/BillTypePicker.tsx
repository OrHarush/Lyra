import { BILL_TYPES, FixedExpenseDetailsDTO } from '@lyra/shared';
import { Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import OptionChip from '@/components/features/fixedExpenses/OptionChip';
import { getChipRowStyle } from '@/components/features/fixedExpenses/styles';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { BILL_TYPE_ICONS } from '@/utils/entities/fixedExpenseIcons';

const BillTypePicker = () => {
  const { t } = useTranslation('transactions');
  const { control, setValue } = useFormContext<FixedExpenseDetailsDTO>();
  const billType = useWatch({ control, name: 'billType' });

  return (
    <Column spacing={0.75}>
      <Typography variant="caption" color="text.secondary">
        {t('fixedExpense.billType')}
      </Typography>
      <Row spacing={1} sx={getChipRowStyle()}>
        {BILL_TYPES.map(type => (
          <OptionChip
            key={type}
            label={t(`fixedExpense.billTypes.${type}`)}
            icon={<FixedExpenseIcon name={BILL_TYPE_ICONS[type]} size={24} />}
            isSelected={billType === type}
            onClick={() => setValue('billType', type, { shouldDirty: true })}
          />
        ))}
      </Row>
    </Column>
  );
};

export default BillTypePicker;
