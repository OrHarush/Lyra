import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import { MAX_YEARS } from '@/pages/Calculators/CompoundInterest/formValues';
import { getCalculatorFormCardStyle } from '@/pages/Calculators/styles';

const PERCENT_STEP = { htmlInput: { step: 0.1, min: 0, inputMode: 'decimal' as const } };

const CompoundInterestForm = () => {
  const { t } = useTranslation('calculators');

  return (
    <Card sx={getCalculatorFormCardStyle()}>
      <CardContent>
        <Column spacing={2}>
          <Typography variant="subtitle1" fontWeight={600}>
            {t('compoundInterest.formTitle')}
          </Typography>
          <TextInput
            name="initialAmount"
            label={t('compoundInterest.initialAmount')}
            type="number"
            min={0}
            thousandSeparators
          />
          <TextInput
            name="monthlyDeposit"
            label={t('compoundInterest.monthlyDeposit')}
            type="number"
            min={0}
            thousandSeparators
          />
          <TextInput
            name="annualReturnPct"
            label={t('compoundInterest.annualReturnPct')}
            type="number"
            slotProps={PERCENT_STEP}
          />
          <TextInput
            name="annualFeePct"
            label={t('compoundInterest.annualFeePct')}
            type="number"
            slotProps={PERCENT_STEP}
          />
          <TextInput
            name="years"
            label={t('compoundInterest.years')}
            type="number"
            min={1}
            max={MAX_YEARS}
          />
        </Column>
      </CardContent>
    </Card>
  );
};

export default CompoundInterestForm;
