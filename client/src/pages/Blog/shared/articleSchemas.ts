import { ArticleFaqItem } from '@/pages/Blog/shared/types';

const SITE_URL = 'https://lyra-il.com';

interface ArticleSchemaInput {
  headline: string;
  description: string;
  canonical: string;
  publishedDate: string;
}

export const buildArticleSchema = ({
  headline,
  description,
  canonical,
  publishedDate,
}: ArticleSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline,
  description,
  image: `${SITE_URL}/og-image.png`,
  inLanguage: 'he',
  author: { '@type': 'Organization', name: 'Lyra', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'Lyra',
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/lyraIcon.webp` },
  },
  datePublished: publishedDate,
  dateModified: publishedDate,
  mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
});

export const buildFaqSchema = (items: ArticleFaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  inLanguage: 'he',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

interface BreadcrumbInput {
  homeLabel: string;
  blogLabel: string;
  articleTitle: string;
  canonical: string;
}

export const buildBreadcrumbSchema = ({
  homeLabel,
  blogLabel,
  articleTitle,
  canonical,
}: BreadcrumbInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: homeLabel, item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: blogLabel, item: `${SITE_URL}/blog` },
    { '@type': 'ListItem', position: 3, name: articleTitle, item: canonical },
  ],
});
