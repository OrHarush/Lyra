import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface CheckboxFieldProps {
  name: string;
  label: string;
}

const CheckboxField = ({ name, label }: CheckboxFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={!!field.value}
              onChange={event => field.onChange(event.target.checked)}
            />
          }
          label={<Typography variant="body2">{label}</Typography>}
        />
      )}
    />
  );
};

export default CheckboxField;
