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

// `extraOffset` accounts for non-button content above the active row, such as a subtitle.
export const SidebarButtonsStyles = (activeIndex: number, extraOffset = 0): SxProps<Theme> => ({
  position: 'absolute',
  left: '8px',
  right: '8px',
  height: '44px',
  borderRadius: '12px',
  backgroundColor: 'action.selected',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: `translateY(${activeIndex * 52 + 12 + extraOffset}px)`,
  zIndex: 0,
  opacity: activeIndex >= 0 ? 1 : 0,
  pointerEvents: 'none',
});
