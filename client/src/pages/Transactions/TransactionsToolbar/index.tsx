import { Divider } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import TransactionsTotals from '@/pages/Transactions/components/TransactionsTotals';
import TransactionActions from '@/pages/Transactions/TransactionActions';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import TransactionsFilters from '@/pages/Transactions/TransactionsFilters';
import TransactionSearchInput from '@/pages/Transactions/TransactionsFilters/TransactionSearchInput';
import MobileFiltersButton from '@/pages/Transactions/TransactionsToolbar/MobileFiltersButton';
import TransactionsFiltersSheet from '@/pages/Transactions/TransactionsToolbar/TransactionsFiltersSheet';
import TransactionTypeToggle from '@/pages/Transactions/TransactionsToolbar/TransactionTypeToggle';
import { useTransactionsPageQuery } from '@/pages/Transactions/useTransactionsPageQuery';

interface TransactionsToolbarProps {
  openCreateDialog: () => void;
}

const TransactionsToolbar = ({ openCreateDialog }: TransactionsToolbarProps) => {
  const isSmallScreen = useIsSmallScreen();
  const [isFiltersOpen, openFilters, closeFilters] = useOpen();
  const { activeFilterCount } = useTransactionPageData();
  const { totals, isLoading } = useTransactionsPageQuery();

  return (
    <Column sx={{ flexShrink: 0 }}>
      <Column spacing={1.5} sx={{ p: 2 }}>
        {isSmallScreen ? (
          <>
            <TransactionTypeToggle isFullWidth />
            <Row spacing={1} alignItems="center">
              <TransactionSearchInput />
              <MobileFiltersButton activeCount={activeFilterCount} onClick={openFilters} />
            </Row>
          </>
        ) : (
          <>
            <Row justifyContent="space-between" alignItems="center" spacing={2}>
              <TransactionTypeToggle />
              <TransactionSearchInput />
            </Row>
            <Row justifyContent="space-between" alignItems="center" spacing={2}>
              <TransactionsFilters />
              <TransactionActions openCreateDialog={openCreateDialog} />
            </Row>
          </>
        )}
        <TransactionsTotals totals={totals} isLoading={isLoading} />
      </Column>
      <Divider />
      {isSmallScreen && <TransactionsFiltersSheet isOpen={isFiltersOpen} closeDialog={closeFilters} />}
    </Column>
  );
};

export default TransactionsToolbar;
