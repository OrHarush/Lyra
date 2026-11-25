import { alpha, SxProps, Theme } from '@mui/material';

export const getSegmentedToggleStyle = (): SxProps<Theme> => ({
  p: '4px',
  borderRadius: '12px',
  bgcolor: theme => alpha(theme.palette.text.secondary, 0.08),
});

export const getSegmentedOptionStyle = (isSelected: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 0.5,
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  color: isSelected ? 'primary.main' : 'text.secondary',
  bgcolor: theme => (isSelected ? alpha(theme.palette.primary.main, 0.16) : 'transparent'),
});
