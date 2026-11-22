import { Divider } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import TransactionsTotals from '@/pages/Transactions/components/TransactionsTotals';
import TransactionActions from '@/pages/Transactions/TransactionActions';
import TransactionsFilters from '@/pages/Transactions/TransactionsFilters';
import TransactionSearchInput from '@/pages/Transactions/TransactionsFilters/TransactionSearchInput';
import TransactionTypeToggle from '@/pages/Transactions/TransactionsToolbar/TransactionTypeToggle';
import { useTransactionsPageQuery } from '@/pages/Transactions/useTransactionsPageQuery';

interface TransactionsToolbarProps {
  openCreateDialog: () => void;
}

const TransactionsToolbar = ({ openCreateDialog }: TransactionsToolbarProps) => {
  const { totals, isLoading } = useTransactionsPageQuery();

  return (
    <Column sx={{ flexShrink: 0 }}>
      <Column spacing={1.5} sx={{ p: 2 }}>
        <Row alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
          <TransactionTypeToggle />
          <TransactionSearchInput />
          <Row alignItems="center" spacing={1.5} sx={{ marginInlineStart: 'auto' }}>
            <TransactionsFilters />
            <TransactionActions openCreateDialog={openCreateDialog} />
          </Row>
        </Row>
        <TransactionsTotals totals={totals} isLoading={isLoading} />
      </Column>
      <Divider />
    </Column>
  );
};

export default TransactionsToolbar;
