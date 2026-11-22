import { Box, Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { getBreakdownLeaderStyle } from '@/pages/Calculators/styles';

interface BreakdownRowProps {
  label: string;
  value: number;
  isDetail?: boolean;
  isTotal?: boolean;
  currency?: string;
}

const BreakdownRow = ({
  label,
  value,
  isDetail = false,
  isTotal = false,
  currency,
}: BreakdownRowProps) => {
  const textVariant = isDetail ? 'caption' : 'body2';
  const fontWeight = isTotal ? 700 : 400;
  const color = isDetail ? 'text.secondary' : 'text.primary';

  return (
    <Row alignItems="baseline" sx={{ py: isDetail ? 0.125 : 0.375, paddingInlineStart: isDetail ? '16px' : 0 }}>
      <Typography variant={textVariant} color={color} fontWeight={fontWeight}>
        {label}
      </Typography>
      <Box component="span" sx={getBreakdownLeaderStyle()} />
      <CurrencyText
        value={value}
        currency={currency}
        variant={isTotal ? 'subtitle1' : textVariant}
        color={color}
        fontWeight={fontWeight}
        sx={{ whiteSpace: 'nowrap' }}
      />
    </Row>
  );
};

export default BreakdownRow;
