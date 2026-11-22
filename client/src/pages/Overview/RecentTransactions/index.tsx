import { useState } from 'react';

import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useRecentTransactions } from '@/hooks/entities/useRecentTransactions';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import RecentTransactionRow from '@/pages/Overview/RecentTransactions/RecentTransactionRow';
import RecentTransactionsCard from '@/pages/Overview/RecentTransactions/RecentTransactionsCard';
import RecentTransactionsEmpty from '@/pages/Overview/RecentTransactions/RecentTransactionsEmpty';
import RecentTransactionsError from '@/pages/Overview/RecentTransactions/RecentTransactionsError';
import RecentTransactionsHeader from '@/pages/Overview/RecentTransactions/RecentTransactionsHeader';
import RecentTransactionsSkeleton from '@/pages/Overview/RecentTransactions/RecentTransactionsSkeleton';
import EditTransactionDialog from '@/pages/Transactions/components/EditTransactionDialog';
import { ExpandedTransactionDto } from '@/types/Transaction';

const DESKTOP_LIMIT = 5;
const MOBILE_LIMIT = 3;

interface RecentTransactionsProps {
  onAddTransaction: () => void;
}

const RecentTransactions = ({ onAddTransaction }: RecentTransactionsProps) => {
  const isSmallScreen = useIsSmallScreen();
  const limit = isSmallScreen ? MOBILE_LIMIT : DESKTOP_LIMIT;
  const { account } = useOverviewFilters();
  const { transactions, isLoading, isError, refetch } = useRecentTransactions(account?._id, limit);
  const [selected, setSelected] = useState<ExpandedTransactionDto>();

  if (isLoading) {
    return <RecentTransactionsSkeleton rows={limit} />;
  }

  const renderBody = () => {
    if (isError) {
      return <RecentTransactionsError retry={refetch} />;
    }

    if (transactions.length === 0) {
      return <RecentTransactionsEmpty onAddTransaction={onAddTransaction} />;
    }

    return transactions.map(transaction => (
      <RecentTransactionRow
        key={transaction._id}
        transaction={transaction}
        onSelect={setSelected}
      />
    ));
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
