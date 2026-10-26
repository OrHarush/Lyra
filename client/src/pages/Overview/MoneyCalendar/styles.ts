import { alpha, SxProps, Theme } from '@mui/material';

export const MAX_WEEK_COUNT = 6;
export const CALENDAR_HEADER_HEIGHT = 24;
export const WEEKDAY_ROW_HEIGHT = 18;
export const MIN_DAY_CELL_HEIGHT = 28;

export const getCalendarGridStyle = (weekCount: number) => ({
  flex: 1,
  display: 'grid',
  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
  gridTemplateRows: `${WEEKDAY_ROW_HEIGHT}px repeat(${weekCount}, minmax(${MIN_DAY_CELL_HEIGHT}px, 1fr))`,
  rowGap: 0.5,
  columnGap: 0.25,
  textAlign: 'center',
});

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
  height: '100%',
  borderRadius: 1.5,
  alignItems: 'center',
  justifyContent: 'center',
  cursor: isClickable ? 'pointer' : 'default',
  fontSize: '0.8rem',
  lineHeight: 1.2,
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
