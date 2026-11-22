import { CHILD_CREDIT_POINTS, ChildAgeBracket, getChildCreditPoints } from '@lyra/shared';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton } from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RHFSelect from '@/components/shared/inputs/RHFSelect';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { NetSalaryFormValues } from '@/pages/Calculators/NetSalary/formValues';

const CHILD_AGE_BRACKETS = Object.keys(CHILD_CREDIT_POINTS) as ChildAgeBracket[];
const DEFAULT_NEW_CHILD_BRACKET: ChildAgeBracket = 'age6to17';

const ChildrenFields = () => {
  const { t } = useTranslation('calculators');
  const { control } = useFormContext<NetSalaryFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'childAges' });
  const sex = useWatch({ control, name: 'sex' });

  const ageOptions = CHILD_AGE_BRACKETS.map(bracket => ({
    value: bracket,
    label: t(`netSalary.childAge.${bracket}`, { points: getChildCreditPoints(bracket, sex) }),
  }));

  const addChild = () => append({ bracket: DEFAULT_NEW_CHILD_BRACKET });

  return (
    <Column spacing={1}>
      {fields.map((field, index) => (
        <Row key={field.id} spacing={1} alignItems="center">
          <RHFSelect
            name={`childAges.${index}.bracket`}
            label={t('netSalary.childLabel', { number: index + 1 })}
            options={ageOptions}
          />
          <IconButton
            aria-label={t('netSalary.removeChild')}
            onClick={() => remove(index)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Row>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={addChild} sx={{ alignSelf: 'flex-start', gap: 1, '& .MuiButton-startIcon': { m: 0 } }}>
        {t('netSalary.addChild')}
      </Button>
    </Column>
  );
};

export default ChildrenFields;
