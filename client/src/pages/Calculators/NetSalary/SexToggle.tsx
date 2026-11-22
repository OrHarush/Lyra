import type { Sex } from '@lyra/shared';
import FemaleIcon from '@mui/icons-material/Female';
import MaleIcon from '@mui/icons-material/Male';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { NetSalaryFormValues } from '@/pages/Calculators/NetSalary/formValues';

const SEX_OPTIONS: Sex[] = ['male', 'female'];

const SEX_ICONS = { male: MaleIcon, female: FemaleIcon };

const SexToggle = () => {
  const { t } = useTranslation('calculators');
  const { control } = useFormContext<NetSalaryFormValues>();

  return (
    <Controller
      name="sex"
      control={control}
      render={({ field }) => (
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          color="primary"
          value={field.value}
          aria-label={t('netSalary.sex')}
          onChange={(_, value: Sex | null) => {
            if (value) {
              field.onChange(value);
            }
          }}
          sx={{ height: 56 }}
        >
          {SEX_OPTIONS.map(option => {
            const SexIcon = SEX_ICONS[option];

            return (
              <ToggleButton key={option} value={option} sx={{ gap: 0.75 }}>
                <SexIcon fontSize="small" />
                {t(`netSalary.${option}`)}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      )}
    />
  );
};

export default SexToggle;
