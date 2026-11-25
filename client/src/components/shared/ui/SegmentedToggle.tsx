import { ButtonBase } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import {
  getSegmentedOptionStyle,
  getSegmentedToggleStyle,
} from '@/components/shared/ui/segmentedToggleStyles';

export interface SegmentedOption<TValue extends string | number> {
  value: TValue;
  label: string;
}

interface SegmentedToggleProps<TValue extends string | number> {
  options: SegmentedOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel?: string;
}

const SegmentedToggle = <TValue extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedToggleProps<TValue>) => (
  <Row role="group" aria-label={ariaLabel} spacing={0.5} sx={getSegmentedToggleStyle()}>
    {options.map(option => (
      <ButtonBase
        key={option.value}
        aria-pressed={value === option.value}
        onClick={() => onChange(option.value)}
        sx={getSegmentedOptionStyle(value === option.value)}
      >
        {option.label}
      </ButtonBase>
    ))}
  </Row>
);

export default SegmentedToggle;
