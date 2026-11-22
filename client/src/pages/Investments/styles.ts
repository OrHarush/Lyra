import { alpha, SxProps, Theme } from '@mui/material';

import type { FundColor } from '@/theme/investmentColors';

const CARD_RADIUS = 2;
const BADGE_MIN_WIDTH = 38;
const BADGE_FONT_SIZE = '0.6875rem';

export const getInvestmentCardStyle = (): SxProps<Theme> => ({
  bgcolor: 'background.paper',
  borderRadius: CARD_RADIUS,
  p: { xs: 2, md: 2.5 },
});

export const getOverviewCardStyle = (): SxProps<Theme> => ({
  bgcolor: 'background.paper',
  borderRadius: CARD_RADIUS,
  overflow: 'hidden',
  flexDirection: { xs: 'column', lg: 'row' },
});

const SIDE_PANEL_WIDTH = 380;

export const getOverviewSidePanelStyle = (): SxProps<Theme> => ({
  p: { xs: 2, md: 3 },
  width: { lg: SIDE_PANEL_WIDTH },
  flexShrink: 0,
  borderStyle: 'solid',
  borderWidth: 0,
  borderBottomWidth: { xs: '1px', lg: 0 },
  borderInlineEndWidth: { xs: 0, lg: '1px' },
  borderColor: 'divider',
});

export const getProfitPillStyle = (isLoss: boolean): SxProps<Theme> => ({
  px: 1.25,
  py: 0.5,
  borderRadius: '8px',
  color: isLoss ? 'error.main' : 'success.main',
  bgcolor: theme => alpha(isLoss ? theme.palette.error.main : theme.palette.success.main, 0.12),
});

export const getRangeSegmentsStyle = (): SxProps<Theme> => ({
  p: '4px',
  borderRadius: '12px',
  bgcolor: theme => alpha(theme.palette.text.secondary, 0.08),
});

export const getRangeOptionStyle = (isSelected: boolean): SxProps<Theme> => ({
  px: 1.5,
  py: 0.5,
  borderRadius: '8px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: isSelected ? 'primary.main' : 'text.secondary',
  bgcolor: theme => (isSelected ? alpha(theme.palette.primary.main, 0.16) : 'transparent'),
});

const PURCHASE_CARD_WIDTH = 300;

export const getPurchaseStripStyle = (): SxProps<Theme> => ({
  overflowX: 'auto',
  pb: 1,
  scrollSnapType: 'x proximity',
  scrollbarWidth: 'thin',
});

export const getPurchaseCardStyle = (isClickable: boolean): SxProps<Theme> => ({
  width: PURCHASE_CARD_WIDTH,
  flexShrink: 0,
  scrollSnapAlign: 'start',
  bgcolor: 'background.paper',
  borderRadius: '20px',
  border: '1px solid',
  borderColor: theme => alpha(theme.palette.text.secondary, 0.22),
  p: 2,
  alignItems: 'stretch',
  textAlign: 'start',
  cursor: isClickable ? 'pointer' : 'default',
  transition: 'border-color 150ms ease-out, background-color 150ms ease-out',
  '&:hover, &.Mui-focusVisible': isClickable
    ? {
        borderColor: 'primary.main',
        bgcolor: theme => alpha(theme.palette.primary.main, 0.06),
      }
    : {},
});

export const getFundDotStyle = (color: FundColor): SxProps<Theme> => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  bgcolor: color.main,
  flexShrink: 0,
});

export const getFundBadgeStyle = (color: FundColor): SxProps<Theme> => ({
  color: color.tint,
  bgcolor: alpha(color.main, 0.12),
  borderRadius: '8px',
  fontSize: BADGE_FONT_SIZE,
  fontWeight: 700,
  px: '6px',
  py: '4px',
  minWidth: BADGE_MIN_WIDTH,
  textAlign: 'center',
  lineHeight: 1.2,
  flexShrink: 0,
});
