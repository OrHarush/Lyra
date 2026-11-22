import type { SxProps, Theme } from '@mui/material';

const MIN_FIT_VIEWPORT_HEIGHT = 180;

// In fit mode the rows are laid out absolutely inside a viewport sized by the card, so the
// rows never push the dashboard row taller — which would make the count chase itself.
export const getRecentListViewportStyle = (isFitMode: boolean): SxProps<Theme> =>
  isFitMode
    ? { flex: 1, minHeight: MIN_FIT_VIEWPORT_HEIGHT, position: 'relative' }
    : { flex: 'none' };

export const getRecentListContentStyle = (isFitMode: boolean): SxProps<Theme> =>
  isFitMode ? { position: 'absolute', inset: 0, overflow: 'hidden' } : {};
