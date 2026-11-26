import { FixedExpenseKind } from '@lyra/shared';
import { Button, Card, Divider } from '@mui/material';
import { Fragment, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import Column from '@/components/shared/layout/containers/Column';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useFixedExpenses, useUpdateFixedExpenseDetails } from '@/hooks/entities/useFixedExpenses';
import CancelFixedExpenseDialog from '@/pages/FixedExpenses/CancelFixedExpenseDialog';
import ClassifyBanner from '@/pages/FixedExpenses/ClassifyBanner';
import EditFixedExpenseDialog from '@/pages/FixedExpenses/EditFixedExpenseDialog';
import FixedExpenseRow from '@/pages/FixedExpenses/FixedExpenseRow';
import FixedExpensesEmptyState from '@/pages/FixedExpenses/FixedExpensesEmptyState';
import FixedExpensesErrorState from '@/pages/FixedExpenses/FixedExpensesErrorState';
import FixedExpensesIntro from '@/pages/FixedExpenses/FixedExpensesIntro';
import FixedExpensesSkeleton from '@/pages/FixedExpenses/FixedExpensesSkeleton';
import FixedExpensesSummary from '@/pages/FixedExpenses/FixedExpensesSummary';
import { getAddButtonStyle, getContentStyle, getListCardStyle } from '@/pages/FixedExpenses/styles';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { FixedExpenseDto } from '@/types/FixedExpense';
import {
  isMostlyUnclassified,
  openCancellationPage,
  sortByNextCharge,
} from '@/utils/entities/fixedExpense';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; item: FixedExpenseDto }
  | { mode: 'cancel'; item: FixedExpenseDto };

const FixedExpensesPage = () => {
  const { t } = useTranslation('fixedExpenses');
  const { t: tTransactions } = useTranslation('transactions');
  const { alertSuccess, alertError } = useSnackbar();
  const isSmallScreen = useIsSmallScreen();
  const { fixedExpenses, isLoading, isError, refetch } = useFixedExpenses();
  const updateDetails = useUpdateFixedExpenseDetails();
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [classifyingId, setClassifyingId] = useState<string | null>(null);

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

  const classifyExpense = async (item: FixedExpenseDto, kind: FixedExpenseKind) => {
    setClassifyingId(item._id);

    try {
      await updateDetails.mutateAsync({ id: item._id, kind });
      alertSuccess(
        t('toast.classified', { name: item.name, kind: tTransactions(`fixedExpense.kinds.${kind}`) })
      );
    } catch {
      alertError(t('errors.updateFailed'));
    } finally {
      setClassifyingId(null);
    }
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

    const items = sortByNextCharge(fixedExpenses.items);

    return (
      <>
        <FixedExpensesSummary totals={fixedExpenses.totals} items={items} />
        {isMostlyUnclassified(items) && <ClassifyBanner />}
        <Card sx={getListCardStyle()}>
          {items.map((item, index) => (
            <Fragment key={item._id}>
              {index > 0 && <Divider />}
              <FixedExpenseRow
                item={item}
                isClassifying={classifyingId === item._id}
                onClassify={classifyExpense}
                onCancel={startCancellation}
                onEdit={openEditDialog}
              />
            </Fragment>
          ))}
        </Card>
        {!isSmallScreen && (
          <Button variant="outlined" onClick={openCreateDialog} sx={getAddButtonStyle()}>
            {t('add')}
          </Button>
        )}
      </>
    );
  };

  return (
    <PageLayout hasNaturalHeight>
      <Column spacing={2.5} sx={getContentStyle()}>
        <FixedExpensesIntro />
        {renderContent()}
      </Column>
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
