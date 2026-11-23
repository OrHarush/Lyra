import {
  calculateCompoundInterest,
  COMPOUND_INTEREST_DEFAULTS,
  CompoundInterestFormValues,
  toCompoundInterestInput,
} from '@lyra/shared';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import Column from '@/components/shared/layout/containers/Column';
import CompoundInterestForm from '@/pages/Calculators/CompoundInterest/CompoundInterestForm';
import CompoundInterestResults from '@/pages/Calculators/CompoundInterest/CompoundInterestResults';
import { getCalculatorLayoutStyle } from '@/pages/Calculators/styles';

interface CompoundInterestCalculatorProps {
  showYearlyTable?: boolean;
}

const CompoundInterestCalculator = ({ showYearlyTable = false }: CompoundInterestCalculatorProps) => {
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
        <CompoundInterestResults result={result} years={input.years} showYearlyTable={showYearlyTable} />
      </Column>
    </FormProvider>
  );
};

export default CompoundInterestCalculator;
