import { FormControl, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import {
  getToggleButtonGroupStyles,
  getToggleButtonStyles,
} from '@/components/shared/inputs/TypeToggleField/styles';

export interface ToggleOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface RHFToggleGroupProps<TValue extends string> {
  name: string;
  label: string;
  options: ToggleOption<TValue>[];
  defaultValue?: TValue;
}

const RHFToggleGroup = <TValue extends string>({
  name,
  label,
  options,
  defaultValue,
}: RHFToggleGroupProps<TValue>) => {
  const theme = useTheme();
  const { control } = useFormContext();
  const color = theme.palette.primary.main;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = (field.value as TValue | undefined) ?? defaultValue;
        const selectedIndex = options.findIndex(option => option.value === value);

        return (
          <FormControl component="fieldset" fullWidth>
            <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
              {label}
            </Typography>
            <ToggleButtonGroup
              value={value}
              exclusive
              onChange={(_, nextValue) => {
                if (!nextValue) {
                  return;
                }

                field.onChange(nextValue);
              }}
              sx={[
                getToggleButtonGroupStyles(color, selectedIndex, options.length),
                { width: '100%' },
              ]}
            >
              {options.map(option => (
                <ToggleButton
                  key={option.value}
                  value={option.value}
                  size="small"
                  sx={[
                    getToggleButtonStyles(value === option.value, color),
                    { flex: 1, minWidth: { xs: 0 }, px: { xs: 0.5, sm: 2 } },
                  ]}
                >
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </FormControl>
        );
      }}
    />
  );
};

export default RHFToggleGroup;
