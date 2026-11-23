import { SITE_NAME, SITE_URL } from '@/constants/Site';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

interface BuildCalculatorSchemasParams {
  path: string;
  name: string;
  description: string;
  language: string;
  breadcrumbs: BreadcrumbItem[];
  faqItems: FaqItem[];
}

export const buildCalculatorSchemas = ({
  path,
  name,
  description,
  language,
  breadcrumbs,
  faqItems,
}: BuildCalculatorSchemasParams) => ({
  webPage: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${SITE_URL}${path}`,
    inLanguage: language,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  },
  breadcrumbList: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.path}`,
    })),
  },
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: language,
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
});
