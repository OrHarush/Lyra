import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { useReviewList } from '@/hooks/entities/useTransactionReview';

import ReviewEmptyState from './ReviewEmptyState';
import ReviewForm from './ReviewForm';
import ReviewSkeleton from './ReviewSkeleton';

const TransactionsReview = () => {
  const { t } = useTranslation('transactions');
  usePageHeader(t('review.pageTitle'));

  const { data, isLoading } = useReviewList();

  const transactions = data?.transactions ?? [];
  const categories = data?.categories ?? [];

  let content: ReactNode;

  if (isLoading) {
    content = <ReviewSkeleton />;
  } else if (!transactions.length) {
    content = <ReviewEmptyState />;
  } else {
    content = (
      <ReviewForm
        key={transactions.map(transaction => transaction._id).join(',')}
        transactions={transactions}
        categories={categories}
      />
    );
  }

  return (
    <PageLayout>{content}</PageLayout>
  );
};

export default TransactionsReview;
