import { FixedExpenseKind } from '@lyra/shared';
import { alpha, SxProps, Theme } from '@mui/material';

export const FIXED_EXPENSES_MAX_WIDTH = 900;

export const getKindColor = (kind: FixedExpenseKind) => (theme: Theme) => {
  const colors: Record<FixedExpenseKind, string> = {
    bill: theme.palette.primary.main,
    subscription: alpha(theme.palette.text.secondary, 0.55),
    regular: alpha(theme.palette.primary.main, 0.4),
  };

  return colors[kind];
};

export const getContentStyle = (): SxProps<Theme> => ({
  width: '100%',
  maxWidth: FIXED_EXPENSES_MAX_WIDTH,
  alignSelf: 'center',
});

export const getSummaryCardStyle = (): SxProps<Theme> => ({
  p: { xs: 2.5, sm: 3 },
  borderRadius: 4,
});

export const getSplitBarStyle = (): SxProps<Theme> => ({
  height: 8,
  width: '100%',
  gap: '4px',
});

export const getSplitSegmentStyle = (kind: FixedExpenseKind, share: number): SxProps<Theme> => ({
  flexGrow: share,
  flexBasis: 0,
  minWidth: 8,
  borderRadius: 999,
  bgcolor: getKindColor(kind),
});

export const getLegendDotStyle = (kind: FixedExpenseKind): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  flexShrink: 0,
  bgcolor: getKindColor(kind),
});

export const getBannerStyle = (): SxProps<Theme> => ({
  borderRadius: 2,
  py: 1.5,
  px: { xs: 2, sm: 2.5 },
  gap: 1.5,
  alignItems: 'flex-start',
  bgcolor: theme => alpha(theme.palette.primary.main, 0.06),
  border: '1px solid',
  borderColor: theme => alpha(theme.palette.primary.main, 0.15),
});

export const getListCardStyle = (): SxProps<Theme> => ({
  px: { xs: 1.5, sm: 2 },
  borderRadius: 3,
});

// Fixed columns keep name, category, date and amount aligned from row to row.
export const getDesktopRowStyle = (): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: '40px minmax(0, 2fr) minmax(0, 1.3fr) 104px 96px 196px',
  alignItems: 'center',
  columnGap: 2,
  minHeight: 64,
  py: 1,
});

export const getMobileRowStyle = (): SxProps<Theme> => ({
  py: 1.25,
  gap: 1.5,
  alignItems: 'center',
});

export const getCancelButtonStyle = (): SxProps<Theme> => ({
  flexShrink: 0,
  borderRadius: 2,
  fontWeight: 700,
  whiteSpace: 'nowrap',
});

export const getQuickChipStyle = (): SxProps<Theme> => ({
  fontWeight: 600,
  height: 28,
});

export const getAddButtonStyle = (): SxProps<Theme> => ({
  py: 1.5,
  borderRadius: 3,
  fontWeight: 700,
});
