import { SxProps, Theme } from '@mui/material';

export const getPanelContentStyle = (): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  p: { xs: 2, sm: 2.5 },
  '&:last-child': { pb: { xs: 2, sm: 2.5 } },
});
