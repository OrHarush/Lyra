import { calculateCompoundInterest } from '@lyra/shared';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import Column from '@/components/shared/layout/containers/Column';
import CompoundInterestForm from '@/pages/Calculators/CompoundInterest/CompoundInterestForm';
import CompoundInterestResults from '@/pages/Calculators/CompoundInterest/CompoundInterestResults';
import {
  COMPOUND_INTEREST_DEFAULTS,
  CompoundInterestFormValues,
  toCompoundInterestInput,
} from '@/pages/Calculators/CompoundInterest/formValues';
import { getCalculatorLayoutStyle } from '@/pages/Calculators/styles';

const CompoundInterestCalculator = () => {
  const methods = useForm<CompoundInterestFormValues>({
    defaultValues: COMPOUND_INTEREST_DEFAULTS,
    mode: 'onChange',
  });
  const values = useWatch({ control: methods.control });

  const input = toCompoundInterestInput(values);
  const result = calculateCompoundInterest(input);

  return (
    <FormProvider {...methods}>
      <Column sx={getCalculatorLayoutStyle()}>
        <CompoundInterestForm />
        <CompoundInterestResults result={result} years={input.years} />
      </Column>
    </FormProvider>
  );
};

export default CompoundInterestCalculator;
