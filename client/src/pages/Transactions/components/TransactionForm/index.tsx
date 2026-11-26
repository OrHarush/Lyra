import { TransactionFormValues } from '@lyra/shared';
import { Divider, Grid, InputAdornment } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import QuickChipsRow from '@/components/features/transactions/QuickChipsRow';
import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import DayDateSelector from '@/components/shared/ui/DayDateSelector';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import AccountSection from '@/pages/Transactions/components/TransactionForm/AccountSection';
import AddNoteSection from '@/pages/Transactions/components/TransactionForm/AddNoteSection';
import BillingCycleHint from '@/pages/Transactions/components/TransactionForm/BillingCycleHint';
import ClassificationSection from '@/pages/Transactions/components/TransactionForm/ClassificationSection';
import EstimatedAmountHint from '@/pages/Transactions/components/TransactionForm/EstimatedAmountHint';
import FixedExpenseSection from '@/pages/Transactions/components/TransactionForm/FixedExpenseSection';
import FrequencyToggle from '@/pages/Transactions/components/TransactionForm/FrequencyToggle';
import PaymentSection from '@/pages/Transactions/components/TransactionForm/PaymentSection';
import PreviousMonthCheckboxRow from '@/pages/Transactions/components/TransactionForm/PreviousMonthCheckboxRow';
import PreviousMonthCollapse from '@/pages/Transactions/components/TransactionForm/PreviousMonthCollapse';
import RecurringDatePills from '@/pages/Transactions/components/TransactionForm/RecurringDatePills';
import TransactionBaseDetails from '@/pages/Transactions/components/TransactionForm/TransactionBaseDetails';
import TransactionTypeSelector from '@/pages/Transactions/components/TransactionForm/TransactionTypeSelector';

const amountInputSx = {
  '& .MuiFilledInput-root': { height: '72px' },
  '& .MuiFilledInput-input': {
    py: 1,
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
  },
  '& .MuiInputAdornment-root': {
    color: 'text.secondary',
  },
};

const blockNegativeAmountKeys = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
    event.preventDefault();
  }
};

const mobileAmountSx = {
  '& .MuiFilledInput-root': {
    backgroundColor: 'transparent',
    '&:hover': { backgroundColor: 'transparent' },
    '&.Mui-focused': { backgroundColor: 'transparent' },
    '&::before': { borderBottom: 'none' },
    '&::after': { borderBottom: 'none' },
  },
  '& .MuiFilledInput-input': {
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    py: 1,
  },
};

const TransactionForm = ({
  disableTypeSelector = false,
  hideRecurrence = false,
  showQuickChips = false,
}: {
  disableTypeSelector?: boolean;
  hideRecurrence?: boolean;
  showQuickChips?: boolean;
}) => {
  const { t } = useTranslation('transactions');
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TransactionFormValues>();
  const recurrence = useWatch({ control, name: 'recurrence' });
  const transactionType = useWatch({ control, name: 'type' });
  const date = useWatch({ control, name: 'date' });
  const isSmallScreen = useIsSmallScreen();
  const [activeChipId, setActiveChipId] = useState<string | null>(null);

  const isRecurring = !hideRecurrence && recurrence !== 'None';
  const isTransfer = transactionType === 'Transfer';

  const selectedDate = date && dayjs(date).isValid() ? dayjs(date) : dayjs();

  const handleDateChange = (newDate: dayjs.Dayjs) =>
    setValue('date', newDate.format('YYYY-MM-DD'), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

  const amountField = (
    <TextInput
      name="amount"
      label={t('fields.amount')}
      type="number"
      placeholder={'0'}
      onKeyDown={blockNegativeAmountKeys}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start">₪</InputAdornment>,
        },
        htmlInput: {
          dir: 'ltr',
          min: 0,
          inputMode: 'decimal',
        },
      }}
      sx={amountInputSx}
    />
  );

  if (isSmallScreen) {
    return (
      <Column spacing={2} height="auto">
        <TransactionTypeSelector disabled={disableTypeSelector} />
        {showQuickChips && (
          <Row justifyContent="center">
            <QuickChipsRow activeChipId={activeChipId} setActiveChipId={setActiveChipId} />
          </Row>
        )}
        <TextInput
          name="amount"
          type="number"
          placeholder="0"
          hiddenLabel
          onKeyDown={blockNegativeAmountKeys}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">₪</InputAdornment>,
            },
            htmlInput: { dir: 'ltr', min: 0, inputMode: 'decimal' },
          }}
          sx={mobileAmountSx}
        />
        <EstimatedAmountHint />
        {!isRecurring && (
          <Row justifyContent="center">
            <DayDateSelector value={selectedDate} onChange={handleDateChange} />
          </Row>
        )}
        {isRecurring && <RecurringDatePills />}
        <BillingCycleHint />
        <Grid container spacing={1.5}>
          {!isTransfer && (
            <>
              <TransactionBaseDetails />
              <ClassificationSection />
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={1}>
                  <AccountSection xsSize={6} />
                  <PaymentSection xsSize={6} />
                </Grid>
              </Grid>
            </>
          )}
          {isTransfer && (
            <>
              <AccountSection />
              <PaymentSection />
            </>
          )}
        </Grid>
        <PreviousMonthCollapse />
        {!hideRecurrence && <FrequencyToggle />}
        {!hideRecurrence && <FixedExpenseSection />}
        <AddNoteSection />
      </Column>
    );
  }

  return (
    <Column spacing={2} height="auto" minHeight={'500px'}>
      <Row justifyContent={'center'}>
        {!isRecurring && <DayDateSelector value={selectedDate} onChange={handleDateChange} />}
      </Row>
      {isRecurring && <RecurringDatePills />}
      <BillingCycleHint />
      <TransactionTypeSelector disabled={disableTypeSelector} />
      {showQuickChips && (
        <QuickChipsRow activeChipId={activeChipId} setActiveChipId={setActiveChipId} />
      )}
      {amountField}
      <EstimatedAmountHint />
      <Grid container spacing={2}>
        {!isTransfer && (
          <>
            <TransactionBaseDetails />
            <ClassificationSection />
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>
            <AccountSection smSize={6} />
            <PaymentSection smSize={6} />
          </>
        )}
        {isTransfer && (
          <>
            <AccountSection />
            <PaymentSection smSize={12} />
          </>
        )}
      </Grid>
      <PreviousMonthCheckboxRow />
      {!hideRecurrence && <FrequencyToggle />}
      {!hideRecurrence && <FixedExpenseSection />}
      <TextInput
        name="note"
        label={t('fields.note')}
        placeholder={t('fields.notePlaceholder')}
        maxLength={200}
      />
    </Column>
  );
};

export default TransactionForm;
