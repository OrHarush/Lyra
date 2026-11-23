import { alpha, Box, Typography, useTheme } from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { ROUTES } from '@/constants/Routes';

const INSTAGRAM_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FACEBOOK_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TIKTOK_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z" />
  </svg>
);

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/lyra__il/', icon: INSTAGRAM_ICON },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61574432020138', icon: FACEBOOK_ICON },
  { label: 'TikTok', href: 'https://www.tiktok.com/@lyra_il', icon: TIKTOK_ICON },
] as const;

interface FooterLink {
  label: string;
  href: string;
  newTab?: boolean;
}

const Footer = () => {
  const { t } = useTranslation(['home', 'common']);
  const theme = useTheme();

  const links: FooterLink[] = [
    {
      label: t('common:nav.blog'),
      href: ROUTES.BLOG_URL,
    },
    {
      label: t('common:nav.calculators'),
      href: ROUTES.CALCULATORS_URL,
    },
    {
      label: t('common:legal.termsOfService'),
      href: ROUTES.TERMS_OF_SERVICE_URL,
      newTab: true,
    },
    {
      label: t('common:legal.privacyPolicy'),
      href: ROUTES.PRIVACY_POLICY_URL,
      newTab: true,
    },
    {
      label: t('common:legal.accessibility'),
      href: ROUTES.ACCESSIBILITY_URL,
      newTab: true,
    },
  ];

  return (
    <Column
      component={'section'}
      alignItems="center"
      spacing={1.5}
      sx={{
        pt: 3,
        position: 'relative',
        zIndex: 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
      }}
    >
      <Row spacing={1} flexWrap="wrap" justifyContent="center" sx={{ rowGap: 0.5 }}>
        {links.map((link, index) => (
          <Fragment key={link.label}>
            <Typography
              component="a"
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab ? 'noopener noreferrer' : undefined}
              variant="caption"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { color: 'text.primary' },
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Typography>
            {index < links.length - 1 && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                •
              </Typography>
            )}
          </Fragment>
        ))}
      </Row>

      <Row spacing={1.5} justifyContent="center">
        {SOCIAL_LINKS.map(link => (
          <Box
            key={link.label}
            component="a"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            sx={{
              display: 'flex',
              color: 'text.secondary',
              transition: 'color 0.2s',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {link.icon}
          </Box>
        ))}
      </Row>

      <Typography
        component="a"
        href="mailto:support@lyra-il.com"
        variant="caption"
        sx={{
          color: 'text.secondary',
          textDecoration: 'none',
          '&:hover': { color: 'text.primary' },
          transition: 'color 0.2s',
        }}
      >
        {t('home:footerContact')}
      </Typography>

      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.72rem' }}>
        {t('common:legal.footer')}
      </Typography>
    </Column>
  );
};

export default Footer;
