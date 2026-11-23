import { Typography } from '@mui/material';

import { ROUTES } from '@/constants/Routes';

const inlineLinkSx = {
  color: 'primary.main',
  textDecoration: 'underline',
  textDecorationColor: 'rgba(167,139,250,0.4)',
  transition: 'text-decoration-color 0.2s',
  '&:hover': { textDecorationColor: '#a78bfa' },
} as const;

interface ArticleLinkProps {
  route: keyof typeof ROUTES;
  label: string;
}

const ArticleLink = ({ route, label }: ArticleLinkProps) => (
  <Typography component="a" href={ROUTES[route]} sx={inlineLinkSx}>
    {label}
  </Typography>
);

export default ArticleLink;
