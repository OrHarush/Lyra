import { useState } from 'react';

import { useFittingRowCount } from '@/hooks/common/useFittingRowCount';
import { useIsLargeScreen } from '@/hooks/common/useIsLargeScreen';
import { useRecentTransactions } from '@/hooks/entities/useRecentTransactions';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import RecentTransactionRow from '@/pages/Overview/RecentTransactions/RecentTransactionRow';
import RecentTransactionsCard from '@/pages/Overview/RecentTransactions/RecentTransactionsCard';
import RecentTransactionsEmpty from '@/pages/Overview/RecentTransactions/RecentTransactionsEmpty';
import RecentTransactionsError from '@/pages/Overview/RecentTransactions/RecentTransactionsError';
import RecentTransactionsHeader from '@/pages/Overview/RecentTransactions/RecentTransactionsHeader';
import RecentTransactionsList from '@/pages/Overview/RecentTransactions/RecentTransactionsList';
import RecentTransactionsSkeleton from '@/pages/Overview/RecentTransactions/RecentTransactionsSkeleton';
import EditTransactionDialog from '@/pages/Transactions/components/EditTransactionDialog';
import { ExpandedTransactionDto } from '@/types/Transaction';

const COMPACT_ROW_COUNT = 5;
const MIN_FIT_ROW_COUNT = 3;
const MAX_FIT_ROW_COUNT = 15;
const ROW_GAP_PX = 8;

interface RecentTransactionsProps {
  onAddTransaction: () => void;
}

const RecentTransactions = ({ onAddTransaction }: RecentTransactionsProps) => {
  const isLargeScreen = useIsLargeScreen();
  const fetchLimit = isLargeScreen ? MAX_FIT_ROW_COUNT : COMPACT_ROW_COUNT;
  const { account } = useOverviewFilters();
  const { transactions, isLoading, isError, refetch } = useRecentTransactions(
    account?._id,
    fetchLimit
  );
  const { containerRef, count } = useFittingRowCount({
    isEnabled: isLargeScreen,
    fallbackCount: COMPACT_ROW_COUNT,
    minCount: MIN_FIT_ROW_COUNT,
    maxCount: MAX_FIT_ROW_COUNT,
    rowGap: ROW_GAP_PX,
    renderedRowCount: transactions.length,
  });
  const [selected, setSelected] = useState<ExpandedTransactionDto>();

  if (isLoading) {
    return <RecentTransactionsSkeleton rows={COMPACT_ROW_COUNT} />;
  }

  const renderBody = () => {
    if (isError) {
      return <RecentTransactionsError retry={refetch} />;
    }

    if (transactions.length === 0) {
      return <RecentTransactionsEmpty onAddTransaction={onAddTransaction} />;
    }

    return (
      <RecentTransactionsList viewportRef={containerRef} isFitMode={isLargeScreen}>
        {transactions.slice(0, count).map(transaction => (
          <RecentTransactionRow
            key={transaction._id}
            transaction={transaction}
            onSelect={setSelected}
          />
        ))}
      </RecentTransactionsList>
    );
  };

  return (
    <RecentTransactionsCard>
      <RecentTransactionsHeader hasSeeAll={transactions.length > 0} />
      {renderBody()}
      {selected && (
        <EditTransactionDialog
          isOpen
          closeDialog={() => setSelected(undefined)}
          transaction={selected}
        />
      )}
    </RecentTransactionsCard>
  );
};

export default RecentTransactions;
