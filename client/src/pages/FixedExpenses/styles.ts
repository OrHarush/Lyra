import { FixedExpenseKind } from '@lyra/shared';
import { alpha, SxProps, Theme } from '@mui/material';

export const getKindColor = (kind: FixedExpenseKind) => (theme: Theme) => {
  const colors: Record<FixedExpenseKind, string> = {
    bill: theme.palette.primary.main,
    subscription: alpha(theme.palette.text.secondary, 0.55),
    regular: alpha(theme.palette.primary.main, 0.4),
  };

  return colors[kind];
};

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

export const getBillGridStyle = (): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(170px, 1fr))' },
  gap: { xs: 1.25, sm: 2 },
});

export const getBillCardStyle = (): SxProps<Theme> => ({
  width: '100%',
  height: '100%',
  p: { xs: 1.5, sm: 2 },
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  textAlign: 'center',
});

export const getRowCardStyle = (): SxProps<Theme> => ({
  p: { xs: 1.5, sm: 2 },
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
});

export const getCancelButtonStyle = (): SxProps<Theme> => ({
  flexShrink: 0,
  minWidth: 88,
  borderRadius: 3,
  fontWeight: 700,
  py: 1,
});

export const getAddButtonStyle = (): SxProps<Theme> => ({
  py: 1.75,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: '1rem',
});
