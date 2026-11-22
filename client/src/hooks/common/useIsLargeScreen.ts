import { useMediaQuery, useTheme } from '@mui/material';

export const useIsLargeScreen = () => {
  const theme = useTheme();

  return useMediaQuery(theme.breakpoints.up('lg'));
};
