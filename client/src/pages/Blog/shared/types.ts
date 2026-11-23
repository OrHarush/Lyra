import { ROUTES } from '@/constants/Routes';

export interface ArticleTableContent {
  columns: string[];
  rows: string[][];
  highlightRows?: number[];
  note?: string;
}

export interface ArticleSectionContent {
  id: string;
  title: string;
  level?: 2 | 3;
  variant?: 'callout';
  paragraphs?: string[];
  bullets?: string[];
  numbered?: string[];
  table?: ArticleTableContent;
  after?: string[];
  linkRoute?: keyof typeof ROUTES;
  linkLabel?: string;
}

export interface ArticleFaqItem {
  q: string;
  a: string;
}

export interface ArticleContent {
  title: string;
  intro: string[];
  keyFacts: string[];
  sections: ArticleSectionContent[];
  cta: string;
  faq: { heading: string; items: ArticleFaqItem[] };
}
