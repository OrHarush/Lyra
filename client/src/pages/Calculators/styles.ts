import type { SxProps, Theme } from '@mui/material';


export const getCalculatorLayoutStyle = (): SxProps<Theme> => ({
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: { xs: 'stretch', md: 'flex-start' },
  gap: 2,
});

export const getCalculatorFormCardStyle = (): SxProps<Theme> => ({
  borderRadius: 2,
  flex: { md: '0 0 360px' },
  minWidth: 0,
});

export const getCalculatorResultsStyle = (): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  gap: 2,
});

export const getNetSalaryLayoutStyle = (): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.15fr) minmax(0, 1fr)' },
  gridTemplateRows: { md: 'minmax(0, 1fr)' },
  maxHeight: { md: '100%' },
  gap: 2,
  alignItems: { xs: 'start', md: 'stretch' },
});

export const getCalculatorContentStyle = (): SxProps<Theme> => ({
  flex: { md: 1 },
  minHeight: { md: 0 },
});

export const getNetSalaryResultsStyle = (): SxProps<Theme> => ({
  display: { xs: 'contents', md: 'flex' },
  flexDirection: 'column',
  gap: 1.5,
  minWidth: 0,
  height: { md: 0 },
  minHeight: { md: '100%' },
  '& > *': { flexShrink: 0 },
});

export const getNetSalaryFormColumnStyle = (): SxProps<Theme> => ({
  minWidth: 0,
  minHeight: 0,
  '& > *': { flexShrink: 0 },
});

// The page background is painted above and beside the card so scrolled content can't show in the gap around it.
export const getNetSummaryCardStyle = (): SxProps<Theme> => theme => ({
  borderRadius: 2,
  order: { xs: -1, md: 0 },
  position: { xs: 'sticky', md: 'static' },
  top: { xs: 8 },
  zIndex: 2,
  boxShadow: { xs: `0 -8px 0 8px ${theme.palette.background.default}`, md: 'none' },
});

export const getBreakdownCardStyle = (): SxProps<Theme> => ({
  borderRadius: 2,
  order: { xs: 1, md: 0 },
  display: 'flex',
  flexDirection: 'column',
  flex: { md: 1 },
});

export const getFieldGridStyle = (columns: number, keepColumnsOnMobile: boolean): SxProps<Theme> => ({
  display: 'grid',
  gridTemplateColumns: {
    xs: `repeat(${keepColumnsOnMobile ? columns : 1}, minmax(0, 1fr))`,
    sm: `repeat(${columns}, minmax(0, 1fr))`,
  },
  gap: 1.5,
  alignItems: 'start',
});

export const getBreakdownLeaderStyle = (): SxProps<Theme> => ({
  flex: 1,
  minWidth: 8,
  mx: 1,
  borderBottom: '1px dotted',
  borderColor: 'divider',
  transform: 'translateY(-3px)',
});
