import { Button, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useCategoryTransactions } from '@/hooks/entities/useCategoryTransactions';
import CategoryTrendsError from '@/pages/CategoryTrends/CategoryTrendsError';
import SortToggle from '@/pages/CategoryTrends/SortToggle';
import TrendTransactionRow from '@/pages/CategoryTrends/TrendTransactionRow';
import TrendTransactionsSkeleton from '@/pages/CategoryTrends/TrendTransactionsSkeleton';
import { formatMonthTitle, TrendSort } from '@/utils/entities/categoryTrends';

interface TrendTransactionsProps {
  categoryId: string | undefined;
  month: string;
  sort: TrendSort;
  onSortChange: (sort: TrendSort) => void;
}

const TrendTransactions = ({ categoryId, month, sort, onSortChange }: TrendTransactionsProps) => {
  const { t } = useTranslation('categoryTrends');
  const list = useCategoryTransactions(categoryId, month, sort);

  const renderBody = () => {
    if (list.isError) {
      return (
        <CategoryTrendsError message={t('error.transactions')} onRetry={() => list.refetch()} />
      );
    }

    if (list.isLoading) {
      return <TrendTransactionsSkeleton />;
    }

    if (list.transactions.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }} align="center">
          {t('transactions.empty')}
        </Typography>
      );
    }

    return (
      <Column divider={<Divider flexItem />}>
        {list.transactions.map(transaction => (
          <TrendTransactionRow key={transaction._id} transaction={transaction} />
        ))}
      </Column>
    );
  };

  return (
    <Column spacing={1.5}>
      <Row alignItems="center" justifyContent="space-between" flexWrap="wrap" rowGap={1} columnGap={2}>
        <Typography variant="h6" fontWeight={700}>
          {t('transactions.title', { month: formatMonthTitle(month) })}
        </Typography>
        <SortToggle value={sort} onChange={onSortChange} />
      </Row>
      {renderBody()}
      {list.hasNextPage && (
        <Button
          variant="outlined"
          disabled={list.isFetchingNextPage}
          onClick={() => list.fetchNextPage()}
          sx={{ alignSelf: 'center' }}
        >
          {t('transactions.showMore')}
        </Button>
      )}
    </Column>
  );
};

export default TrendTransactions;
