import { Theme } from '@mui/material';

export type TrendDirection = 'up' | 'down' | 'neutral';

// Up is red and down is green because this is spending: more is worse, less is better.
export const getTrendColor = (direction: TrendDirection, theme: Theme) => {
  if (direction === 'up') {
    return theme.palette.error.main;
  }

  return direction === 'down' ? theme.palette.success.main : theme.palette.text.secondary;
};
