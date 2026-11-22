import TextInput from '@/components/shared/inputs/TextInput';

interface PercentInputProps {
  name: string;
  label: string;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const PercentInput = ({ name, label, max = 100, step = 0.5, disabled = false }: PercentInputProps) => (
  <TextInput
    name={name}
    label={label}
    type="number"
    min={0}
    max={max}
    disabled={disabled}
    slotProps={{ htmlInput: { step, min: 0, max, inputMode: 'decimal' } }}
  />
);

export default PercentInput;
