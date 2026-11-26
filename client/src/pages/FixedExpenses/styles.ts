import { alpha, SxProps, Theme } from '@mui/material';

import { FixedExpenseGroupId } from '@/utils/entities/fixedExpenseGroups';

export const FIXED_EXPENSES_MAX_WIDTH = 1040;
export const GROUP_ICON_SIZE = 64;
export const CHARGE_ICON_SIZE = 48;
export const DONUT_SIZE = { compact: 132, wide: 160 };

export const getGroupColor = (id: FixedExpenseGroupId) => (theme: Theme) => {
  const colors: Record<FixedExpenseGroupId, string> = {
    housing: theme.palette.primary.main,
    loans: theme.palette.primary.dark,
    subscriptions: theme.palette.success.main,
    insurance: theme.palette.warning.main,
    bills: theme.palette.info.main,
    other: alpha(theme.palette.text.secondary, 0.6),
  };

  return colors[id];
};

export const getContentStyle = (): SxProps<Theme> => ({
  width: '100%',
  maxWidth: FIXED_EXPENSES_MAX_WIDTH,
  alignSelf: 'center',
});

export const getCardStyle = (): SxProps<Theme> => ({
  p: { xs: 2, md: 3 },
  borderRadius: 5,
});

export const getSummaryGridStyle = (): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 2.5,
});

export const getNextChargeBoxStyle = (): SxProps<Theme> => ({
  p: 1.5,
  borderRadius: 3,
  bgcolor: 'background.default',
});

export const getLegendDotStyle = (id: FixedExpenseGroupId): SxProps<Theme> => ({
  width: 9,
  height: 9,
  borderRadius: '50%',
  flexShrink: 0,
  bgcolor: getGroupColor(id),
});

export const getPromptCardStyle = (): SxProps<Theme> => ({
  p: { xs: 2, md: 2.25 },
  borderRadius: 5,
  border: '1px solid',
  borderColor: theme => alpha(theme.palette.primary.main, 0.35),
  bgcolor: theme => alpha(theme.palette.primary.main, 0.07),
});

export const getPillButtonStyle = (): SxProps<Theme> => ({
  borderRadius: 999,
  px: 2.25,
  fontWeight: 700,
  whiteSpace: 'nowrap',
});

export const getGroupGridStyle = (): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
  gap: { xs: 1.5, md: 2 },
});

export const getGroupCardStyle = (): SxProps<Theme> => ({
  width: '100%',
  height: '100%',
  p: 2,
  borderRadius: 5,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  textAlign: 'start',
  justifyContent: 'stretch',
});

export const getChargeListStyle = (): SxProps<Theme> => ({
  px: { xs: 2, md: 2.5 },
  py: 0.5,
  borderRadius: 5,
});

export const getChargeRowStyle = (): SxProps<Theme> => ({
  minHeight: 72,
  gap: 1.5,
  alignItems: 'center',
});

// A ring rather than a disc, so the placeholder has the donut's shape.
export const getDonutSkeletonStyle = (): SxProps<Theme> => ({
  flexShrink: 0,
  mask: 'radial-gradient(circle, transparent 57%, #000 58%)',
});
