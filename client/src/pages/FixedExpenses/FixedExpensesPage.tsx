import { Box, Button } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import Column from '@/components/shared/layout/containers/Column';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import { useFixedExpenses } from '@/hooks/entities/useFixedExpenses';
import BillCard from '@/pages/FixedExpenses/BillCard';
import CancelFixedExpenseDialog from '@/pages/FixedExpenses/CancelFixedExpenseDialog';
import EditFixedExpenseDialog from '@/pages/FixedExpenses/EditFixedExpenseDialog';
import FixedExpenseListRow from '@/pages/FixedExpenses/FixedExpenseListRow';
import FixedExpensesEmptyState from '@/pages/FixedExpenses/FixedExpensesEmptyState';
import FixedExpensesErrorState from '@/pages/FixedExpenses/FixedExpensesErrorState';
import FixedExpensesIntro from '@/pages/FixedExpenses/FixedExpensesIntro';
import FixedExpensesSection from '@/pages/FixedExpenses/FixedExpensesSection';
import FixedExpensesSkeleton from '@/pages/FixedExpenses/FixedExpensesSkeleton';
import FixedExpensesSummary from '@/pages/FixedExpenses/FixedExpensesSummary';
import { getAddButtonStyle, getBillGridStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { openCancellationPage } from '@/utils/entities/fixedExpense';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; item: FixedExpenseDto }
  | { mode: 'cancel'; item: FixedExpenseDto };

const FixedExpensesPage = () => {
  const { t } = useTranslation('fixedExpenses');
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

    const bills = fixedExpenses.items.filter(item => item.kind === 'bill');
    const subscriptions = fixedExpenses.items.filter(item => item.kind === 'subscription');
    const others = fixedExpenses.items.filter(item => item.kind === 'regular');

    return (
      <>
        <FixedExpensesSummary totals={fixedExpenses.totals} items={fixedExpenses.items} />
        {bills.length > 0 && (
          <FixedExpensesSection kind="bill">
            <Box sx={getBillGridStyle()}>
              {bills.map(item => (
                <BillCard key={item._id} item={item} onEdit={openEditDialog} />
              ))}
            </Box>
          </FixedExpensesSection>
        )}
        {subscriptions.length > 0 && (
          <FixedExpensesSection kind="subscription">
            <Column spacing={1.25}>
              {subscriptions.map(item => (
                <FixedExpenseListRow
                  key={item._id}
                  item={item}
                  onEdit={openEditDialog}
                  onCancel={startCancellation}
                />
              ))}
            </Column>
          </FixedExpensesSection>
        )}
        {others.length > 0 && (
          <FixedExpensesSection kind="regular">
            <Column spacing={1.25}>
              {others.map(item => (
                <FixedExpenseListRow key={item._id} item={item} onEdit={openEditDialog} />
              ))}
            </Column>
          </FixedExpensesSection>
        )}
        <Button variant="contained" fullWidth onClick={openCreateDialog} sx={getAddButtonStyle()}>
          {t('add')}
        </Button>
      </>
    );
  };

  return (
    <PageLayout hasNaturalHeight spacing={3}>
      <FixedExpensesIntro />
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
