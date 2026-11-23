import type { SxProps, Theme } from '@mui/material';

export const bodyTextSx = { color: 'text.secondary', lineHeight: 1.8 } as const;
export const headingSx = { fontWeight: 700, color: 'text.primary' } as const;

const PROSE_MAX_WIDTH = 760;
const EMBED_FIXED_HEIGHT = 760;

export const getProseStyle = (): SxProps<Theme> => ({
  width: '100%',
  maxWidth: PROSE_MAX_WIDTH,
  alignSelf: 'center',
  textAlign: 'start',
});

export const getEmbedStyle = (hasFixedHeight: boolean): SxProps<Theme> => ({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: hasFixedHeight ? { md: EMBED_FIXED_HEIGHT } : undefined,
});

export const getH1Style = (): SxProps<Theme> => ({
  ...headingSx,
  letterSpacing: 'normal',
  fontSize: { xs: '1.6rem', sm: '2.25rem', md: '3rem' },
});

export const getHubCardStyle = (): SxProps<Theme> => theme => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  p: { xs: 2.5, sm: 3 },
  textDecoration: 'none',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '16px',
  transition: 'border-color 0.2s, transform 0.2s',
  '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)' },
});
