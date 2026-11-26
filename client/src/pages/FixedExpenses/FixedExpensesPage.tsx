import { FixedExpenseKind } from '@lyra/shared';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import Column from '@/components/shared/layout/containers/Column';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import ActionFab from '@/components/shared/ui/ActionFab';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useFixedExpenses, useUpdateFixedExpenseDetails } from '@/hooks/entities/useFixedExpenses';
import CancelFixedExpenseDialog from '@/pages/FixedExpenses/CancelFixedExpenseDialog';
import ClassifyPromptCard from '@/pages/FixedExpenses/ClassifyPromptCard';
import EditFixedExpenseDialog from '@/pages/FixedExpenses/EditFixedExpenseDialog';
import FixedExpensesEmptyState from '@/pages/FixedExpenses/FixedExpensesEmptyState';
import FixedExpensesErrorState from '@/pages/FixedExpenses/FixedExpensesErrorState';
import FixedExpensesIntro from '@/pages/FixedExpenses/FixedExpensesIntro';
import FixedExpensesSkeleton from '@/pages/FixedExpenses/FixedExpensesSkeleton';
import FixedExpensesSummary from '@/pages/FixedExpenses/FixedExpensesSummary';
import GroupDialog from '@/pages/FixedExpenses/GroupDialog';
import GroupsSection from '@/pages/FixedExpenses/GroupsSection';
import { getContentStyle } from '@/pages/FixedExpenses/styles';
import UpcomingCharges from '@/pages/FixedExpenses/UpcomingCharges';
import { useSkippedPrompts } from '@/pages/FixedExpenses/useSkippedPrompts';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { FixedExpenseDto } from '@/types/FixedExpense';
import {
  listUnclassified,
  openCancellationPage,
  sortByNextCharge,
} from '@/utils/entities/fixedExpense';
import {
  buildFixedExpenseGroups,
  FixedExpenseGroup,
  FixedExpenseGroupId,
} from '@/utils/entities/fixedExpenseGroups';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'group'; groupId: FixedExpenseGroupId }
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
  const { skippedIds, skipPrompt } = useSkippedPrompts();

  const openCreateDialog = useCallback(() => setDialog({ mode: 'create' }), []);
  const openEditDialog = (item: FixedExpenseDto) => setDialog({ mode: 'edit', item });
  const closeDialog = () => setDialog({ mode: 'closed' });
  const openGroupDialog = (group: FixedExpenseGroup) =>
    setDialog({ mode: 'group', groupId: group.id });

  // The provider's page opens in the same click so browsers don't block it as a popup.
  const startCancellation = (item: FixedExpenseDto) => {
    if (item.cancelUrl) {
      openCancellationPage(item.cancelUrl);
    }

    setDialog({ mode: 'cancel', item });
  };

  const classifyExpense = async (item: FixedExpenseDto, kind: FixedExpenseKind) => {
    try {
      await updateDetails.mutateAsync({ id: item._id, kind });
      alertSuccess(
        t('toast.classified', { name: item.name, kind: tTransactions(`fixedExpense.kinds.${kind}`) })
      );
    } catch {
      alertError(t('errors.updateFailed'));
    }
  };

  const items = sortByNextCharge(fixedExpenses?.items ?? []);
  const groups = buildFixedExpenseGroups(items);
  const openGroup =
    dialog.mode === 'group' ? groups.find(group => group.id === dialog.groupId) : undefined;
  const prompts = listUnclassified(items).filter(item => !skippedIds.includes(item._id));

  usePrimaryAction(openCreateDialog);

  const renderContent = () => {
    if (isLoading) {
      return <FixedExpensesSkeleton />;
    }

    if (isError || !fixedExpenses) {
      return <FixedExpensesErrorState onRetry={() => refetch()} />;
    }

    if (items.length === 0) {
      return <FixedExpensesEmptyState onAdd={openCreateDialog} />;
    }

    return (
      <>
        <FixedExpensesSummary totals={fixedExpenses.totals} groups={groups} nextCharge={items[0]} />
        {prompts.length > 0 && (
          <ClassifyPromptCard
            item={prompts[0]}
            remaining={prompts.length - 1}
            isSaving={updateDetails.isPending}
            onClassify={classifyExpense}
            onSkip={item => skipPrompt(item._id)}
          />
        )}
        <GroupsSection groups={groups} onOpen={openGroupDialog} />
        <UpcomingCharges items={items} onEdit={openEditDialog} onCancel={startCancellation} />
      </>
    );
  };

  return (
    <PageLayout hasNaturalHeight>
      <Column spacing={2.5} sx={getContentStyle()}>
        <FixedExpensesIntro />
        {renderContent()}
      </Column>
      {!isSmallScreen && <ActionFab onClick={openCreateDialog} />}
      {openGroup && (
        <GroupDialog
          isOpen
          closeDialog={closeDialog}
          group={openGroup}
          onEdit={openEditDialog}
          onCancel={startCancellation}
        />
      )}
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
