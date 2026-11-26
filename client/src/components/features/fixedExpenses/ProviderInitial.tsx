import { Box } from '@mui/material';

import { getProviderInitialStyle } from '@/components/features/fixedExpenses/styles';

// Stands in for provider logos until we have licensed artwork.
const ProviderInitial = ({ name }: { name: string }) => (
  <Box component="span" aria-hidden sx={getProviderInitialStyle()}>
    {name.trim().charAt(0).toUpperCase()}
  </Box>
);

export default ProviderInitial;
