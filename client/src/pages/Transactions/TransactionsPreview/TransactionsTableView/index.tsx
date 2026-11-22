import { Table, TableContainer, TablePagination } from '@mui/material';
import { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EntityError from '@/components/entities/EntityError';
import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import Column from '@/components/shared/layout/containers/Column';
import UndoSnackbar from '@/components/shared/ui/UndoSnackbar';
import { useGhosts } from '@/hooks/entities/useGoals';
import { formatGoalAmount } from '@/pages/Goals/utils/goalFormatters';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import TransactionTableBody from '@/pages/Transactions/TransactionsPreview/TransactionsTableView/TransactionsTableBody/TransactionTableBody';
import TransactionsTableSkeleton from '@/pages/Transactions/TransactionsPreview/TransactionsTableView/TransactionsTableSkeleton';
import TransactionTableHeaders from '@/pages/Transactions/TransactionsPreview/TransactionsTableView/TransactionTableHeaders';
import { useGhostQuickContribute } from '@/pages/Transactions/TransactionsPreview/useGhostQuickContribute';
import { useTransactionsPageQuery } from '@/pages/Transactions/useTransactionsPageQuery';
import type { GhostContributionDto } from '@/types/Goal';
import { SortableColumn, SortOrder } from '@/types/Transaction';
import { compareTransactions } from '@/utils/entities/transaction';

const TransactionsTableView = () => {
  const { t } = useTranslation('transactions');
  const { t: tGoals } = useTranslation('goals');
  const { t: tCommon } = useTranslation('common');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [orderBy, setOrderBy] = useState<SortableColumn>('date');
  const [dialogGhost, setDialogGhost] = useState<GhostContributionDto | null>(null);
  const { selectedMonth, page, setPage, pageSize, setPageSize } = useTransactionPageData();
  const selectedYearMonth = useMemo(() => selectedMonth.format('YYYY-MM'), [selectedMonth]);

  const { transactions, pagination, isLoading, error, refetch } = useTransactionsPageQuery();

  const { ghosts } = useGhosts(selectedYearMonth);
  const {
    contribute,
    undo,
    dismiss,
    pending,
    defaultAccountId,
    defaultPaymentMethodId,
  } = useGhostQuickContribute();

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => compareTransactions(a, b, order, orderBy)),
    [transactions, order, orderBy]
  );

  const handleSort = (column: SortableColumn) => {
    setOrder(prev => (orderBy === column && prev === 'asc' ? 'desc' : 'asc'));
    setOrderBy(column);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage + 1);

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  const openGhostDialog = (ghost: GhostContributionDto) => setDialogGhost(ghost);
  const closeGhostDialog = () => setDialogGhost(null);

  if (isLoading) {
    return <TransactionsTableSkeleton />;
  }

  if (error) {
    return <EntityError entityName={'transactions'} refetch={refetch} />;
  }

  return (
    <Column spacing={2} flex={1} minHeight={0}>
      <Column flex={1} minHeight={0} sx={{ overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1, minHeight: 0 }}>
          <Table
            stickyHeader
            aria-label="transactions table"
            sx={{
              height: sortedTransactions.length === 0 ? '100%' : 'auto',
              borderCollapse: 'separate',
              borderSpacing: 0,
              '& th': {
                backgroundColor: 'background.paper',
                fontWeight: 600,
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& td': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <TransactionTableHeaders order={order} orderBy={orderBy} onSort={handleSort} />
            <TransactionTableBody
              transactions={sortedTransactions}
              ghosts={ghosts}
              onLogContribution={contribute}
              onOpenGhostDialog={openGhostDialog}
            />
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination?.total ?? 0}
          page={page - 1}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage={t('table.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) =>
            t('table.displayedRows', { from, to, count })
          }
        />
      </Column>
      {dialogGhost && (
        <CreateTransactionDialog
          isOpen
          closeDialog={closeGhostDialog}
          initialValues={{
            type: 'Expense',
            category: dialogGhost.categoryId,
            amount: dialogGhost.remainingAmount,
            name: tGoals('ghosts.txName', { name: dialogGhost.goalName }),
            account: defaultAccountId,
            paymentMethod: defaultPaymentMethodId,
            date: new Date().toISOString().split('T')[0],
          }}
        />
      )}
      <UndoSnackbar
        open={!!pending}
        message={
          pending
            ? tGoals('ghosts.toast.contributed', {
                amount: formatGoalAmount(pending.amount),
                name: pending.goalName,
              })
            : ''
        }
        undoLabel={tCommon('buttons.undo')}
        onUndo={undo}
        onExpire={dismiss}
      />
    </Column>
  );
};

export default TransactionsTableView;
