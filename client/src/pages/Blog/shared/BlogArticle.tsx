import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import JsonLd from '@/components/seo/JsonLd';
import PageSeo from '@/components/seo/PageSeo';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ScrollableColumn from '@/components/shared/layout/containers/ScrollableColumn';
import Footer from '@/components/shared/layout/Footer';
import { ROUTES } from '@/constants/Routes';
import ArticleKeyFacts from '@/pages/Blog/shared/ArticleKeyFacts';
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from '@/pages/Blog/shared/articleSchemas';
import ArticleSection from '@/pages/Blog/shared/ArticleSection';
import { ArticleContent } from '@/pages/Blog/shared/types';
import FaqAccordion from '@/pages/Home/FaqSection/FaqAccordion';
import CtaButton from '@/pages/Home/HeroSection/HeroContent/CtaButton';
import LandingNavbar from '@/pages/Home/LandingNavbar';

const SITE_URL = 'https://lyra-il.com';

const bodyTextSx = { color: 'text.secondary', lineHeight: 1.8 } as const;
const headingSx = { fontWeight: 700, color: 'text.primary' } as const;

interface BlogArticleProps {
  namespace: string;
  route: keyof typeof ROUTES;
  readingMinutes: number;
  publishedDate: string;
}

const BlogArticle = ({ namespace, route, readingMinutes, publishedDate }: BlogArticleProps) => {
  const { t } = useTranslation(namespace);
  const { t: tBlog } = useTranslation('blog');

  const canonical = `${SITE_URL}${ROUTES[route]}`;
  const content: ArticleContent = {
    title: t('title'),
    intro: t('intro', { returnObjects: true }) as unknown as ArticleContent['intro'],
    keyFacts: t('keyFacts', { returnObjects: true }) as unknown as ArticleContent['keyFacts'],
    sections: t('sections', { returnObjects: true }) as unknown as ArticleContent['sections'],
    cta: t('cta'),
    faq: t('faq', { returnObjects: true }) as unknown as ArticleContent['faq'],
  };
  const seoDescription = t('seo.description');

  const articleSchema = buildArticleSchema({
    headline: content.title,
    description: seoDescription,
    canonical,
    publishedDate,
  });
  const breadcrumbSchema = buildBreadcrumbSchema({
    homeLabel: tBlog('breadcrumbs.home'),
    blogLabel: tBlog('breadcrumbs.blog'),
    articleTitle: content.title,
    canonical,
  });

  return (
    <>
      <PageSeo
        title={t('seo.title')}
        description={seoDescription}
        canonical={canonical}
        ogType="article"
      />
      <JsonLd id={`${namespace}-article-jsonld`} schema={articleSchema} />
      <JsonLd id={`${namespace}-faq-jsonld`} schema={buildFaqSchema(content.faq.items)} />
      <JsonLd id={`${namespace}-breadcrumb-jsonld`} schema={breadcrumbSchema} />
      <LandingNavbar />
      <ScrollableColumn
        component="main"
        alignItems="center"
        sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 }, flex: 1 }}
      >
        <Column
          component="article"
          spacing={3}
          sx={{ width: '100%', maxWidth: 760, textAlign: 'start' }}
        >
          <Column spacing={1}>
            <Typography
              component="h1"
              variant="h3"
              sx={{
                ...headingSx,
                letterSpacing: 'normal',
                fontSize: { xs: '1.6rem', sm: '2.25rem', md: '3rem' },
              }}
            >
              {content.title}
            </Typography>
            <Row alignItems="center" spacing={0.75} sx={{ color: 'text.secondary' }}>
              <AccessTimeRoundedIcon sx={{ fontSize: '1rem' }} />
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>
                {t('readingTime', { minutes: readingMinutes })}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>·</Typography>
              <Typography sx={{ fontSize: '0.85rem', color: 'inherit' }}>
                {t('publishedDate')}
              </Typography>
            </Row>
          </Column>

          {content.intro.map(paragraph => (
            <Typography key={paragraph} variant="body1" sx={bodyTextSx}>
              {paragraph}
            </Typography>
          ))}

          <ArticleKeyFacts facts={content.keyFacts} />

          {content.sections.map(section => (
            <ArticleSection key={section.id} section={section} />
          ))}

          <Column component="section" spacing={1.5}>
            <Typography component="h2" variant="h5" sx={headingSx}>
              {content.faq.heading}
            </Typography>
            {content.faq.items.map(item => (
              <FaqAccordion key={item.q} question={item.q} answer={item.a} />
            ))}
          </Column>

          <Column component="section" alignItems="center" spacing={2} sx={{ py: { xs: 3, md: 5 } }}>
            <Typography variant="body1" sx={{ ...bodyTextSx, textAlign: 'center' }}>
              {content.cta}
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

export default BlogArticle;
