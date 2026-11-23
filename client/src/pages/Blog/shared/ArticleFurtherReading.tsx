import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/Routes';
import ArticleLink from '@/pages/Blog/shared/ArticleLink';

interface FurtherReadingItem {
  route: keyof typeof ROUTES;
  titleKey: string;
}

const NEW_ARTICLES: FurtherReadingItem[] = [
  { route: 'BLOG_FREE_EXPENSE_APPS_URL', titleKey: 'articles.freeExpenseApps.title' },
  {
    route: 'BLOG_CREDIT_CARD_BILLING_CYCLE_URL',
    titleKey: 'articles.creditCardBillingCycle.title',
  },
  { route: 'BLOG_COUPLES_MONEY_URL', titleKey: 'articles.couplesMoney.title' },
];

const ArticleFurtherReading = () => {
  const { t } = useTranslation('blog');

  return (
    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
      {t('furtherReading')}{' '}
      {NEW_ARTICLES.map((article, index) => (
        <span key={article.route}>
          {index > 0 && ' · '}
          <ArticleLink route={article.route} label={t(article.titleKey)} />
        </span>
      ))}
    </Typography>
  );
};

export default ArticleFurtherReading;
