import { Typography } from '@mui/material';

import { getFundBadgeStyle } from '@/pages/Investments/styles';
import type { FundColor } from '@/theme/investmentColors';

interface FundBadgeProps {
  label: string;
  color: FundColor;
}

const FundBadge = ({ label, color }: FundBadgeProps) => (
  <Typography component="span" dir="ltr" sx={getFundBadgeStyle(color)}>
    {label}
  </Typography>
);

export default FundBadge;
