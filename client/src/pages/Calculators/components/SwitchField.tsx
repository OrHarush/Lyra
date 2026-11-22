import { Switch } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

interface SwitchFieldProps {
  name: string;
  label: string;
}

const SwitchField = ({ name, label }: SwitchFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switch
          checked={!!field.value}
          onChange={event => field.onChange(event.target.checked)}
          slotProps={{ input: { 'aria-label': label } }}
        />
      )}
    />
  );
};

export default SwitchField;
