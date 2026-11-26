import { Box } from '@mui/material';

import { getCoinStyle, getIconBoxStyle } from '@/components/features/fixedExpenses/styles';

// The illustration set has no loans artwork, so a coin is drawn to match its size.
const CoinIcon = ({ size }: { size: number }) => (
  <Box aria-hidden sx={getIconBoxStyle(size)}>
    <Box sx={getCoinStyle(size)}>₪</Box>
  </Box>
);

export default CoinIcon;
