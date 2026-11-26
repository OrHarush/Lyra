import { SxProps, Theme } from '@mui/material';

export const getNotificationRowStyle = (): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  gap: 1.5,
  width: '100%',
  p: 1,
  borderRadius: 2,
  textAlign: 'start',
  '&:hover, &.Mui-focusVisible': { backgroundColor: 'action.hover' },
});
