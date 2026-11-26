import { ButtonBase, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { getOptionChipStyle } from '@/components/features/fixedExpenses/styles';

interface OptionChipProps {
  label: string;
  icon: ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

const OptionChip = ({ label, icon, isSelected, onClick }: OptionChipProps) => (
  <ButtonBase aria-pressed={isSelected} onClick={onClick} sx={getOptionChipStyle(isSelected)}>
    {icon}
    <Typography component="span" variant="body2" fontWeight={600} noWrap>
      {label}
    </Typography>
  </ButtonBase>
);

export default OptionChip;
