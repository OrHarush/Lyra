import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { Divider, Typography } from '@mui/material';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import CalculatorsCrossLink from '@/pages/Blog/CalculatorsCrossLink';
import IntroWithCashflowLink from '@/pages/Blog/RiseUpReview/IntroWithCashflowLink';
import ProsConsCards from '@/pages/Blog/RiseUpReview/ProsConsCards';
import QuickVerdict from '@/pages/Blog/RiseUpReview/QuickVerdict';
import VsComparisonTable from '@/pages/Blog/RiseUpReview/VsComparisonTable';
import ClarityCards from '@/pages/Home/DashboardClaritySection/ClarityCards';
import FaqAccordion from '@/pages/Home/FaqSection/FaqAccordion';
import CtaButton from '@/pages/Home/HeroSection/HeroContent/CtaButton';
import LandingNavbar from '@/pages/Home/LandingNavbar';

const CANONICAL_URL = 'https://lyra-il.com/blog/riseup-review';
const PUBLISHED_DATE = '2026-05-30';
const READING_MINUTES = 3;
const SIMPLE_SECTION_KEYS = ['what', 'cost'] as const;

interface FaqItem {
  q: string;
  a: string;
}

const bodyTextSx = { color: 'text.secondary', lineHeight: 1.8 } as const;
const headingSx = { fontWeight: 700, color: 'text.primary' } as const;

const RiseUpReview = () => {
  const { t, i18n } = useTranslation('riseupReview');

  const title = t('title');
  const seoDescription = t('seo.description');
  const alternativeParagraphs = t('sections.alternative.paragraphs', {
    returnObjects: true,
  }) as unknown as string[];
  const faqItems = t('faq.items', { returnObjects: true }) as unknown as FaqItem[];

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
      <JsonLd id="article-jsonld" schema={articleSchema} />
      <JsonLd id="article-faq-jsonld" schema={faqSchema} />
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

          <IntroWithCashflowLink intro={t('intro')} />

          <QuickVerdict />

          {SIMPLE_SECTION_KEYS.map(key => (
            <Column key={key} component="section" spacing={1.5}>
              <Typography component="h2" variant="h5" sx={headingSx}>
                {t(`sections.${key}.heading`)}
              </Typography>
              <Typography variant="body1" sx={bodyTextSx}>
                {t(`sections.${key}.body`)}
              </Typography>
            </Column>
          ))}

          <ProsConsCards />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.whoFor.heading')}
            </Typography>
            <Typography variant="body1" sx={bodyTextSx}>
              {t('sections.whoFor.body')}
            </Typography>
          </Column>

          <VsComparisonTable />

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {t('sections.alternative.heading')}
            </Typography>
            {alternativeParagraphs.map((paragraph, index) => (
              <Fragment key={index}>
                <Typography variant="body1" sx={bodyTextSx}>
                  {paragraph}
                </Typography>
                {index === 0 && (
                  <Column sx={{ width: '100%', maxWidth: 560, alignSelf: 'center', py: 1 }}>
                    <ClarityCards />
                  </Column>
                )}
              </Fragment>
            ))}
          </Column>

          <CalculatorsCrossLink />

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
              {t('sections.alternative.ctaLine')}
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

export default RiseUpReview;
