import { calculateNetSalaryFromForm, NET_SALARY_DEFAULTS, NetSalaryFormValues } from '@lyra/shared';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import Column from '@/components/shared/layout/containers/Column';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import NetSalaryResults from '@/pages/Calculators/NetSalary/NetSalaryResults';
import PensionCard from '@/pages/Calculators/NetSalary/PensionCard';
import SalaryCard from '@/pages/Calculators/NetSalary/SalaryCard';
import StudyFundCard from '@/pages/Calculators/NetSalary/StudyFundCard';
import { getNetSalaryFormColumnStyle, getNetSalaryLayoutStyle } from '@/pages/Calculators/styles';

const NetSalaryCalculator = () => {
  const methods = useForm<NetSalaryFormValues>({
    defaultValues: NET_SALARY_DEFAULTS,
    mode: 'onChange',
  });
  const values = useWatch({ control: methods.control });

  const { creditPoints, input: netSalaryInput, breakdown } = calculateNetSalaryFromForm(values);

  return (
    <FormProvider {...methods}>
      <Column sx={getNetSalaryLayoutStyle()}>
        <ScrollableColumn spacing={1.5} sx={getNetSalaryFormColumnStyle()}>
          <SalaryCard creditPoints={creditPoints} />
          <PensionCard />
          <StudyFundCard breakdown={breakdown} />
        </ScrollableColumn>
        <NetSalaryResults breakdown={breakdown} input={netSalaryInput} />
      </Column>
    </FormProvider>
  );
};

export default NetSalaryCalculator;
