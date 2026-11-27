import { SxProps, Theme } from '@mui/material';

export const SIDEBAR_SUBTITLE_HEIGHT = 36;

// The height is fixed so the sliding highlight can skip over it exactly.
export const getSidebarSubtitleStyle = (): SxProps<Theme> => ({
  height: SIDEBAR_SUBTITLE_HEIGHT,
  mx: 1,
  px: 2,
  borderRadius: '12px',
  justifyContent: 'space-between',
});

export const getSidebarSectionArrowStyle = (isExpanded: boolean): SxProps<Theme> => ({
  fontSize: 18,
  color: 'text.secondary',
  transform: isExpanded ? 'rotate(180deg)' : 'none',
  transition: 'transform 0.2s ease',
});

const getHighlightStyle = (top: number, height: number, isVisible: boolean) => ({
  position: 'absolute',
  left: '8px',
  right: '8px',
  height: `${height}px`,
  borderRadius: '12px',
  backgroundColor: 'action.selected',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: `translateY(${top}px)`,
  zIndex: 0,
  opacity: isVisible ? 1 : 0,
  pointerEvents: 'none',
});

// `extraOffset` accounts for non-button content above the active row, such as a subtitle.
export const SidebarButtonsStyles = (activeIndex: number, extraOffset = 0): SxProps<Theme> =>
  getHighlightStyle(activeIndex * 52 + 12 + extraOffset, 44, activeIndex >= 0);

export const DESKTOP_LIST_PADDING = 8;
export const DESKTOP_ROW_HEIGHT = 40;
export const DESKTOP_ROW_GAP = 2;
export const DESKTOP_HEADER_HEIGHT = 28;
export const DESKTOP_DIVIDER_HEIGHT = 9;

export const getDesktopHighlightStyle = (top: number | null): SxProps<Theme> =>
  getHighlightStyle(top ?? 0, DESKTOP_ROW_HEIGHT, top !== null);

export const getDesktopRowStyle = (): SxProps<Theme> => ({
  height: DESKTOP_ROW_HEIGHT + DESKTOP_ROW_GAP * 2,
  px: 1,
  py: `${DESKTOP_ROW_GAP}px`,
});

export const getDesktopHeaderStyle = (): SxProps<Theme> => ({
  display: 'block',
  height: DESKTOP_HEADER_HEIGHT,
  lineHeight: '20px',
  pt: '6px',
  paddingInline: '24px',
});

// Height includes the 1px border, with equal space above and below it.
export const getDesktopDividerStyle = (): SxProps<Theme> => ({
  mx: 2,
  mt: '4px',
  mb: `${DESKTOP_DIVIDER_HEIGHT - 5}px`,
});
