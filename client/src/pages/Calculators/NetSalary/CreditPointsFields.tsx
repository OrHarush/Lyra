import {
  DegreeType,
  getDefaultGraduationYear,
  getLatestRates,
  ImmigrationPeriod,
  NetSalaryFormValues,
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

const { creditPoints: CREDIT_POINT_RULES } = getLatestRates();
const SERVICE_TYPES = Object.keys(CREDIT_POINT_RULES.service) as ServiceType[];
const IMMIGRATION_PERIODS = Object.keys(CREDIT_POINT_RULES.immigration) as ImmigrationPeriod[];
const DEGREE_TYPES: DegreeType[] = ['none', 'bachelor', 'master'];

const CreditPointsFields = () => {
  const { t } = useTranslation('calculators');
  const { control, setValue } = useFormContext<NetSalaryFormValues>();
  const degreeType = useWatch({ control, name: 'degreeType' });

  // A fresh degree selection would earn 0 points until the user finds the year field, so suggest
  // the most common case: finishing last year.
  useEffect(() => {
    setValue('degreeGraduationYear', getDefaultGraduationYear(degreeType));
  }, [degreeType, setValue]);

  const serviceOptions = SERVICE_TYPES.map(type => ({
    value: type,
    label: t(`netSalary.service.${type}`, { points: CREDIT_POINT_RULES.service[type] }),
  }));

  const immigrationOptions = IMMIGRATION_PERIODS.map(period => ({
    value: period,
    label: t(`netSalary.immigration.${period}`, { points: CREDIT_POINT_RULES.immigration[period] }),
  }));

  const degreeOptions = DEGREE_TYPES.map(type => ({
    value: type,
    label: t(`netSalary.degree.${type}`, { points: type === 'none' ? 0 : CREDIT_POINT_RULES.degree[type].pointsPerYear }),
  }));

  return (
    <Column spacing={1.5}>
      <ChildrenFields />
      <FieldGrid keepColumnsOnMobile>
        <CheckboxField name="isSingleParent" label={t('netSalary.singleParent', { points: CREDIT_POINT_RULES.singleParent })} />
        <TextInput
          name="disabledChildrenCount"
          label={t('netSalary.disabledChildrenCount', { points: CREDIT_POINT_RULES.disabledChild })}
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
          name="degreeGraduationYear"
          label={t('netSalary.degreeGraduationYear')}
          type="number"
          min={0}
          disabled={degreeType === 'none'}
          helperText={degreeType === 'none' ? undefined : t('netSalary.degreeHint')}
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
