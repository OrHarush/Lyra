import { alpha, SxProps, Theme } from '@mui/material';

interface DayCellStyleParams {
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  isClickable: boolean;
}

export const getDayCellStyle = ({
  isToday,
  isPast,
  isSelected,
  isClickable,
}: DayCellStyleParams): SxProps<Theme> => ({
  height: { xs: 34, lg: 40 },
  borderRadius: 1.5,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: isClickable ? 'pointer' : 'default',
  fontSize: { xs: '0.8rem', lg: '0.875rem' },
  fontWeight: isToday ? 600 : 400,
  color: isToday ? 'primary.main' : isPast ? 'text.disabled' : 'text.primary',
  bgcolor: (theme: Theme) => (isToday ? alpha(theme.palette.primary.main, 0.12) : 'transparent'),
  outline: '1.5px solid',
  outlineColor: (theme: Theme) =>
    isSelected && !isToday ? alpha(theme.palette.primary.main, 0.6) : 'transparent',
  transition: 'background-color 0.15s',
  '&:hover': {
    bgcolor: (theme: Theme) =>
      isClickable ? alpha(theme.palette.primary.main, isToday ? 0.18 : 0.06) : undefined,
  },
});

export const getEventDotStyle = (color: 'success' | 'error'): SxProps<Theme> => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  bgcolor: `${color}.main`,
});
