import { alpha, SxProps, Theme } from '@mui/material';

export const getSettingsPaperStyle = (): SxProps<Theme> => ({
  '& .MuiDialog-paper': {
    borderRadius: 3,
    // A fixed height keeps the dialog still while moving between tabs of different lengths.
    height: 'min(680px, calc(100% - 32px))',
    maxHeight: 'none',
    overflow: 'hidden',
  },
  '& .MuiDialogTitle-root': { px: 2.5, py: 1.75 },
});

export const getSettingsSidebarStyle = (): SxProps<Theme> => ({
  width: 220,
  flexShrink: 0,
  overflowY: 'auto',
  p: 1.5,
  backgroundColor: 'background.default',
  borderInlineEnd: 1,
  borderColor: 'divider',
});

export const getSettingsPanelStyle = (isSmallScreen: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflowY: 'auto',
  px: isSmallScreen ? 0 : 3,
  py: 2.5,
});

export const getSettingsTabButtonStyle = (isActive: boolean): SxProps<Theme> => {
  const activeBackground = (theme: Theme) => alpha(theme.palette.primary.main, 0.14);

  return {
    flexGrow: 0,
    gap: 1.5,
    minHeight: 40,
    px: 1.5,
    borderRadius: 2,
    color: isActive ? 'text.primary' : 'text.secondary',
    backgroundColor: isActive ? activeBackground : 'transparent',
    '&:hover': { backgroundColor: isActive ? activeBackground : 'action.hover' },
  };
};
