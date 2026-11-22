import {
  DEGREE_CREDIT_POINTS,
  DegreeType,
  IMMIGRATION_CREDIT_POINTS,
  ImmigrationPeriod,
  SERVICE_CREDIT_POINTS,
  ServiceType,
} from '@lyra/shared';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RHFSelect from '@/components/shared/inputs/RHFSelect';
import TextInput from '@/components/shared/inputs/TextInput';
import Column from '@/components/shared/layout/containers/Column';
import CheckboxField from '@/pages/Calculators/components/CheckboxField';
import FieldGrid from '@/pages/Calculators/components/FieldGrid';
import ChildrenFields from '@/pages/Calculators/NetSalary/ChildrenFields';
import { NetSalaryFormValues } from '@/pages/Calculators/NetSalary/formValues';

const SERVICE_TYPES = Object.keys(SERVICE_CREDIT_POINTS) as ServiceType[];
const IMMIGRATION_PERIODS = Object.keys(IMMIGRATION_CREDIT_POINTS) as ImmigrationPeriod[];
const DEGREE_TYPES = Object.keys(DEGREE_CREDIT_POINTS) as DegreeType[];

const CreditPointsFields = () => {
  const { t } = useTranslation('calculators');
  const { control, setValue } = useFormContext<NetSalaryFormValues>();
  const degreeType = useWatch({ control, name: 'degreeType' });

  // Degree points are per year of study, so a fresh selection would add 0 points until the user
  // finds the years field; start from the standard length instead.
  useEffect(() => {
    setValue('degreeYears', DEGREE_CREDIT_POINTS[degreeType].maxYears);
  }, [degreeType, setValue]);

  const serviceOptions = SERVICE_TYPES.map(type => ({
    value: type,
    label: t(`netSalary.service.${type}`, { points: SERVICE_CREDIT_POINTS[type] }),
  }));

  const immigrationOptions = IMMIGRATION_PERIODS.map(period => ({
    value: period,
    label: t(`netSalary.immigration.${period}`, { points: IMMIGRATION_CREDIT_POINTS[period] }),
  }));

  const degreeOptions = DEGREE_TYPES.map(type => ({
    value: type,
    label: t(`netSalary.degree.${type}`, { points: DEGREE_CREDIT_POINTS[type].pointsPerYear }),
  }));

  return (
    <Column spacing={1.5}>
      <ChildrenFields />
      <FieldGrid keepColumnsOnMobile>
        <CheckboxField name="isSingleParent" label={t('netSalary.singleParent')} />
        <TextInput
          name="disabledChildrenCount"
          label={t('netSalary.disabledChildrenCount')}
          type="number"
          min={0}
          slotProps={{ htmlInput: { step: 1, min: 0 } }}
        />
      </FieldGrid>
      <FieldGrid>
        <RHFSelect name="serviceType" label={t('netSalary.serviceType')} options={serviceOptions} />
        <RHFSelect
          name="immigrationPeriod"
          label={t('netSalary.immigrationPeriod')}
          options={immigrationOptions}
        />
        <RHFSelect name="degreeType" label={t('netSalary.degreeType')} options={degreeOptions} />
        <TextInput
          name="degreeYears"
          label={t('netSalary.degreeYears')}
          type="number"
          min={0}
          disabled={degreeType === 'none'}
          slotProps={{ htmlInput: { step: 1, min: 0 } }}
        />
        <TextInput
          name="reserveDays"
          label={t('netSalary.reserveDays')}
          type="number"
          min={0}
          slotProps={{ htmlInput: { step: 1, min: 0 } }}
        />
        <TextInput
          name="manualCreditPoints"
          label={t('netSalary.manualCreditPoints')}
          type="number"
          min={0}
          slotProps={{ htmlInput: { step: 0.25, min: 0, inputMode: 'decimal' } }}
        />
      </FieldGrid>
    </Column>
  );
};

export default CreditPointsFields;
