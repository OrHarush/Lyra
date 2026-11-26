import { alpha, SxProps, Theme } from '@mui/material';

export const getOptionChipStyle = (isSelected: boolean): SxProps<Theme> => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 1,
  px: 1.25,
  py: 0.75,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: isSelected ? 'primary.main' : 'divider',
  bgcolor: theme => (isSelected ? alpha(theme.palette.primary.main, 0.12) : 'transparent'),
  color: isSelected ? 'primary.main' : 'text.primary',
  flexShrink: 0,
  transition: 'background-color 0.15s ease, border-color 0.15s ease',
});

export const getChipRowStyle = (): SxProps<Theme> => ({
  overflowX: 'auto',
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
});

export const getProviderInitialStyle = (): SxProps<Theme> => ({
  width: 22,
  height: 22,
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
  color: 'primary.main',
  flexShrink: 0,
});

export const getKindSectionStyle = (): SxProps<Theme> => ({
  p: 1.5,
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
});

// The illustrations are drawn for a light backdrop, so the tile stays light in both themes.
const ICON_TILE_BACKGROUND = '#F1EEFB';

export const getIconTileStyle = (size: number, hasTile: boolean): SxProps<Theme> => ({
  position: 'relative',
  width: size,
  height: size,
  flexShrink: 0,
  borderRadius: hasTile ? `${Math.round(size * 0.28)}px` : '6px',
  bgcolor: hasTile ? ICON_TILE_BACKGROUND : 'transparent',
  overflow: 'hidden',
});

export const getIconSkeletonStyle = (): SxProps<Theme> => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
});

export const getIconImageStyle = (isLoaded: boolean, hasTile: boolean): SxProps<Theme> => ({
  width: '100%',
  height: '100%',
  p: hasTile ? '12%' : 0,
  objectFit: 'contain',
  display: 'block',
  opacity: isLoaded ? 1 : 0,
  transition: 'opacity 200ms ease',
});
