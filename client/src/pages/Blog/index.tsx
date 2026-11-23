import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { alpha, Box, Divider, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import PageSeo from '@/components/seo/PageSeo';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import { ROUTES } from '@/constants/Routes';
import LandingNavbar from '@/pages/Home/LandingNavbar';

const CANONICAL_URL = 'https://lyra-il.com/blog';

interface Article {
  titleKey: string;
  descKey: string;
  readMinutes: number;
  publishedDate: string;
  href: string;
  heroImage?: string;
  heroAltKey?: string;
}

const ARTICLES: Article[] = [
  {
    titleKey: 'articles.couplesMoney.title',
    descKey: 'articles.couplesMoney.description',
    readMinutes: 8,
    publishedDate: '24 בנובמבר 2026',
    href: ROUTES.BLOG_COUPLES_MONEY_URL,
    heroImage: '/couples-money-hero.webp',
    heroAltKey: 'articles.couplesMoney.heroAlt',
  },
  {
    titleKey: 'articles.creditCardBillingCycle.title',
    descKey: 'articles.creditCardBillingCycle.description',
    readMinutes: 8,
    publishedDate: '24 בנובמבר 2026',
    href: ROUTES.BLOG_CREDIT_CARD_BILLING_CYCLE_URL,
    heroImage: '/credit-card-billing-cycle-hero.webp',
    heroAltKey: 'articles.creditCardBillingCycle.heroAlt',
  },
  {
    titleKey: 'articles.freeExpenseApps.title',
    descKey: 'articles.freeExpenseApps.description',
    readMinutes: 9,
    publishedDate: '24 בנובמבר 2026',
    href: ROUTES.BLOG_FREE_EXPENSE_APPS_URL,
    heroImage: '/free-expense-apps-hero.webp',
    heroAltKey: 'articles.freeExpenseApps.heroAlt',
  },
  {
    titleKey: 'articles.cashflowGuide.title',
    descKey: 'articles.cashflowGuide.description',
    readMinutes: 5,
    publishedDate: '1 ביוני 2026',
    href: ROUTES.BLOG_CASHFLOW_GUIDE_URL,
    heroImage: '/blog-cashflow-hero.webp',
  },
  {
    titleKey: 'articles.riseupReview.title',
    descKey: 'articles.riseupReview.description',
    readMinutes: 3,
    publishedDate: '30 במאי 2026',
    href: ROUTES.BLOG_RISEUP_REVIEW_URL,
    heroImage: '/blog-riseup-review-hero.webp',
  },
];

const BlogIndex = () => {
  const { t } = useTranslation('blog');
  const theme = useTheme();

  return (
    <>
      <PageSeo
        title={t('seo.title')}
        description={t('seo.description')}
        canonical={CANONICAL_URL}
      />
      <LandingNavbar />
      <ScrollableColumn
        component="main"
        alignItems="center"
        sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 }, flex: 1 }}
      >
        <Column spacing={4} sx={{ width: '100%', maxWidth: 760 }}>
          <Column spacing={0.75}>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: 'normal',
                fontSize: { xs: '1.6rem', sm: '2.25rem', md: '3rem' },
              }}
            >
              {t('heading')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {t('subtitle')}
            </Typography>
          </Column>

          <Column component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {ARTICLES.map(article => (
              <Box
                key={article.href}
                component="li"
                sx={{ display: 'flex' }}
              >
                <Box
                  component="a"
                  href={article.href}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, background-color 0.2s, transform 0.2s',
                    '&:hover': {
                      borderColor: alpha('#a78bfa', 0.45),
                      backgroundColor: alpha('#a78bfa', 0.04),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {article.heroImage && (
                    <Box
                      component="img"
                      src={article.heroImage}
                      alt={article.heroAltKey ? t(article.heroAltKey) : ''}
                      sx={{
                        width: { xs: 96, sm: 120 },
                        alignSelf: 'stretch',
                        objectFit: 'cover',
                        display: 'block',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <Column spacing={1} sx={{ p: { xs: 2, sm: 2.5 }, flex: 1 }}>
                    <Typography
                      component="h2"
                      sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.4 }}
                    >
                      {t(article.titleKey)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.7 }}>
                      {t(article.descKey)}
                    </Typography>
                    <Row alignItems="center" spacing={0.75} sx={{ color: 'text.disabled', mt: 0.5 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: '0.9rem' }} />
                      <Typography sx={{ fontSize: '0.8rem', color: 'inherit' }}>
                        {t('readingTime', { minutes: article.readMinutes })}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'inherit' }}>·</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'inherit' }}>
                        {article.publishedDate}
                      </Typography>
                    </Row>
                  </Column>
                </Box>
              </Box>
            ))}
          </Column>
        </Column>

        <Divider sx={{ mt: 'auto', width: '100%', maxWidth: 900 }} />
        <Footer />
      </ScrollableColumn>
    </>
  );
};

export default BlogIndex;
