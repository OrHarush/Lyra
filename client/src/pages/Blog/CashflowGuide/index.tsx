import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { Divider, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import { ROUTES } from '@/constants/Routes';
import CalculatorsCrossLink from '@/pages/Blog/CalculatorsCrossLink';
import IsraelCallout from '@/pages/Blog/CashflowGuide/IsraelCallout';
import KeyFactsStrip from '@/pages/Blog/CashflowGuide/KeyFactsStrip';
import LyraCapabilitiesTable from '@/pages/Blog/CashflowGuide/LyraCapabilitiesTable';
import MethodCards from '@/pages/Blog/CashflowGuide/MethodCards';
import MethodsComparisonTable from '@/pages/Blog/CashflowGuide/MethodsComparisonTable';
import FaqAccordion from '@/pages/Home/FaqSection/FaqAccordion';
import CtaButton from '@/pages/Home/HeroSection/HeroContent/CtaButton';
import LandingNavbar from '@/pages/Home/LandingNavbar';

const CANONICAL_URL = 'https://lyra-il.com/blog/cashflow-guide';
const PUBLISHED_DATE = '2026-06-01';
const READING_MINUTES = 5;

interface FaqItem {
  q: string;
  a: string;
}

interface BulletPoint {
  lead: string;
  body: string;
}

const bodyTextSx = { color: 'text.secondary', lineHeight: 1.8 } as const;
const headingSx = { fontWeight: 700, color: 'text.primary' } as const;

const CashflowGuide = () => {
  const { t, i18n } = useTranslation('cashflowGuide');

  const title = t('title');
  const seoDescription = t('seo.description');
  const faqItems = t('faq.items', { returnObjects: true }) as unknown as FaqItem[];
  const whatParagraphs = t('sections.whatIsCashflow.paragraphs', {
    returnObjects: true,
  }) as unknown as string[];
  const budgetParagraphs = t('sections.budgetVsCashflow.paragraphs', {
    returnObjects: true,
  }) as unknown as string[];
  const whyDropBullets = t('sections.whyPeopleDrop.bullets', {
    returnObjects: true,
  }) as unknown as BulletPoint[];
  const lyraParagraphs = t('sections.lyra.paragraphs', {
    returnObjects: true,
  }) as unknown as string[];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: seoDescription,
    image: 'https://lyra-il.com/og-image.png',
    inLanguage: i18n.language,
    author: { '@type': 'Organization', name: 'Lyra', url: 'https://lyra-il.com' },
    publisher: {
      '@type': 'Organization',
      name: 'Lyra',
      logo: { '@type': 'ImageObject', url: 'https://lyra-il.com/lyraIcon.webp' },
    },
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL_URL },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: i18n.language,
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      <PageSeo title={t('seo.title')} description={seoDescription} canonical={CANONICAL_URL} ogType="article" />
      <JsonLd id="cashflow-article-jsonld" schema={articleSchema} />
      <JsonLd id="cashflow-faq-jsonld" schema={faqSchema} />
      <LandingNavbar />
      <ScrollableColumn component="main" alignItems="center" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 }, flex: 1 }}>
        <Column component="article" spacing={3} sx={{ width: '100%', maxWidth: 760, textAlign: 'start' }}>
          <Column spacing={1}>
            <Typography
              component="h1"
              variant="h3"
              sx={{ ...headingSx, letterSpacing: 'normal', fontSize: { xs: '1.6rem', sm: '2.25rem', md: '3rem' } }}
            >
              {title}
            </Typography>
            <Row alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
              <AccessTimeRoundedIcon sx={{ fontSize: '1rem' }} />
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>
                {t('readingTime', { minutes: READING_MINUTES })}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>·</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>
                {t('publishedDate')}
              </Typography>
            </Row>
          </Column>

          <Typography variant="body1" sx={bodyTextSx}>
            {t('intro')}
          </Typography>

          <KeyFactsStrip />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.whatIsCashflow.heading')}
            </Typography>
            {whatParagraphs.map((para, i) => (
              <Typography key={i} variant="body1" sx={bodyTextSx}>
                {para}
              </Typography>
            ))}
          </Column>

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.budgetVsCashflow.heading')}
            </Typography>
            {budgetParagraphs.map((para, i) => (
              <Typography key={i} variant="body1" sx={bodyTextSx}>
                {para}
              </Typography>
            ))}
          </Column>

          <Column component="section" spacing={2}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.methods.heading')}
            </Typography>
            <Typography variant="body1" sx={bodyTextSx}>
              {t('sections.methods.intro')}
            </Typography>
            <MethodCards />
          </Column>

          <MethodsComparisonTable />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.whyPeopleDrop.heading')}
            </Typography>
            <Typography variant="body1" sx={bodyTextSx}>
              {t('sections.whyPeopleDrop.intro')}
            </Typography>
            <Column spacing={1} sx={{ pl: { xs: 1, sm: 2 } }}>
              {whyDropBullets.map(point => (
                <Row key={point.lead} spacing={1} alignItems="flex-start">
                  <Typography sx={{ color: 'text.secondary', fontWeight: 700, lineHeight: 1.8, flexShrink: 0 }}>
                    •
                  </Typography>
                  <Typography sx={bodyTextSx}>
                    <Typography component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {point.lead}{' '}
                    </Typography>
                    {point.body}
                  </Typography>
                </Row>
              ))}
            </Column>
            <Typography variant="body1" sx={bodyTextSx}>
              {t('sections.whyPeopleDrop.closing')}
            </Typography>
          </Column>

          <IsraelCallout />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.lyra.heading')}
            </Typography>
            {lyraParagraphs.map((para, i) => (
              <Typography key={i} variant="body1" sx={bodyTextSx}>
                {para}
              </Typography>
            ))}
          </Column>

          <Typography variant="body1" sx={bodyTextSx}>
            {t('sections.lyra.crossLinkBefore')}
            <Link
              href={ROUTES.BLOG_RISEUP_REVIEW_URL}
              sx={{
                color: 'primary.main',
                textDecorationColor: 'rgba(167,139,250,0.4)',
                transition: 'text-decoration-color 0.2s',
                '&:hover': { textDecorationColor: '#a78bfa' },
              }}
            >
              {t('sections.lyra.crossLinkAnchor')}
            </Link>
            {t('sections.lyra.crossLinkAfter')}
          </Typography>

          <CalculatorsCrossLink />

          <LyraCapabilitiesTable />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('faq.heading')}
            </Typography>
            {faqItems.map(item => (
              <FaqAccordion key={item.q} question={item.q} answer={item.a} />
            ))}
          </Column>

          <Column component="section" alignItems="center" spacing={2} sx={{ py: { xs: 3, md: 5 } }}>
            <Typography variant="body1" sx={{ ...bodyTextSx, textAlign: 'center' }}>
              {t('sections.lyra.ctaLine')}
            </Typography>
            <CtaButton labelKey="ctaBottom" />
          </Column>
        </Column>

        <Divider sx={{ mt: 'auto', width: '100%', maxWidth: 900 }} />
        <Footer />
      </ScrollableColumn>
    </>
  );
};

export default CashflowGuide;
