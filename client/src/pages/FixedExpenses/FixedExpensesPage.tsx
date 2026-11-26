import { FIXED_EXPENSE_KINDS } from '@lyra/shared';
import { useCallback, useState } from 'react';

import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import { useFixedExpenses } from '@/hooks/entities/useFixedExpenses';
import CancelFixedExpenseDialog from '@/pages/FixedExpenses/CancelFixedExpenseDialog';
import EditFixedExpenseDialog from '@/pages/FixedExpenses/EditFixedExpenseDialog';
import FixedExpensesEmptyState from '@/pages/FixedExpenses/FixedExpensesEmptyState';
import FixedExpensesErrorState from '@/pages/FixedExpenses/FixedExpensesErrorState';
import FixedExpensesSection from '@/pages/FixedExpenses/FixedExpensesSection';
import FixedExpensesSkeleton from '@/pages/FixedExpenses/FixedExpensesSkeleton';
import FixedExpensesSummary from '@/pages/FixedExpenses/FixedExpensesSummary';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { openCancellationPage } from '@/utils/entities/fixedExpense';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; item: FixedExpenseDto }
  | { mode: 'cancel'; item: FixedExpenseDto };

const SECTION_ORDER = ['subscription', 'bill', 'regular'] as const satisfies readonly (typeof FIXED_EXPENSE_KINDS)[number][];

const FixedExpensesPage = () => {
  const { fixedExpenses, isLoading, isError, refetch } = useFixedExpenses();
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });

  const openCreateDialog = useCallback(() => setDialog({ mode: 'create' }), []);
  const openEditDialog = (item: FixedExpenseDto) => setDialog({ mode: 'edit', item });
  const closeDialog = () => setDialog({ mode: 'closed' });

  // The provider's page opens in the same click so browsers don't block it as a popup.
  const startCancellation = (item: FixedExpenseDto) => {
    if (item.cancelUrl) {
      openCancellationPage(item.cancelUrl);
    }

    setDialog({ mode: 'cancel', item });
  };

  usePrimaryAction(openCreateDialog);

  const renderContent = () => {
    if (isLoading) {
      return <FixedExpensesSkeleton />;
    }

    if (isError || !fixedExpenses) {
      return <FixedExpensesErrorState onRetry={() => refetch()} />;
    }

    if (fixedExpenses.items.length === 0) {
      return <FixedExpensesEmptyState onAdd={openCreateDialog} />;
    }

    return (
      <>
        <FixedExpensesSummary
          totals={fixedExpenses.totals}
          count={fixedExpenses.items.length}
          onAdd={openCreateDialog}
        />
        {SECTION_ORDER.map(kind => (
          <FixedExpensesSection
            key={kind}
            kind={kind}
            items={fixedExpenses.items.filter(item => item.kind === kind)}
            onCancel={startCancellation}
            onEdit={openEditDialog}
          />
        ))}
      </>
    );
  };

  return (
    <PageLayout hasNaturalHeight spacing={2.5}>
      {renderContent()}
      {dialog.mode === 'create' && (
        <CreateTransactionDialog
          isOpen
          closeDialog={closeDialog}
          initialValues={{ type: 'Expense', name: '', recurrence: 'Monthly' }}
        />
      )}
      {dialog.mode === 'edit' && (
        <EditFixedExpenseDialog isOpen closeDialog={closeDialog} item={dialog.item} />
      )}
      {dialog.mode === 'cancel' && (
        <CancelFixedExpenseDialog
          isOpen
          closeDialog={closeDialog}
          item={dialog.item}
          onAddLink={() => openEditDialog(dialog.item)}
        />
      )}
    </PageLayout>
  );
};

export default FixedExpensesPage;
