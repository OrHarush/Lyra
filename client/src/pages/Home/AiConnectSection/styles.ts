import { alpha, SxProps, Theme } from '@mui/material';

export const getChatBubbleStyle = (theme: Theme, isUser: boolean): SxProps<Theme> => ({
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  maxWidth: isUser ? '80%' : '88%',
  px: 2,
  py: 1.5,
  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
  backgroundColor: isUser
    ? alpha(theme.palette.primary.main, 0.18)
    : alpha(theme.palette.text.primary, 0.04),
  border: isUser ? 'none' : `1px solid ${theme.palette.divider}`,
  color: 'text.primary',
  fontSize: '0.95rem',
  lineHeight: 1.7,
});

export const getPillStyle = (theme: Theme): SxProps<Theme> => ({
  fontSize: '0.75rem',
  color: 'text.secondary',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 999,
  px: 1.25,
  py: 0.25,
});

export const getBadgeStyle = (theme: Theme): SxProps<Theme> => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'primary.main',
  backgroundColor: alpha(theme.palette.primary.main, 0.15),
  borderRadius: 999,
  px: 1.25,
  py: 0.5,
});

export const getUrlChipStyle = (theme: Theme): SxProps<Theme> => ({
  alignSelf: 'flex-start',
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: '0.85rem',
  color: 'text.primary',
  backgroundColor: 'background.paper',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 2.5,
  px: 1.5,
  py: 1,
  wordBreak: 'break-all',
});
