import { Paper } from '@mui/material';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import Column from '@/components/shared/layout/containers/Column';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import { useGhosts } from '@/hooks/entities/useGoals';
import { useTransactions } from '@/hooks/entities/useTransactions';
import {
  TransactionPageDataProvider,
  useTransactionPageData,
} from '@/pages/Transactions/TransactionPageDataProvider';
import TransactionDialogs from '@/pages/Transactions/TransactionsDialogs';
import TransactionsEmptyState from '@/pages/Transactions/TransactionsEmptyState';
import MobileTransactionsFilters from '@/pages/Transactions/TransactionsFilters/MobileTransactionsFilters';
import TransactionsHeader from '@/pages/Transactions/TransactionsHeader';
import TransactionsPreview from '@/pages/Transactions/TransactionsPreview';
import TransactionsToolbar from '@/pages/Transactions/TransactionsToolbar';
import { TransactionPageFormValues } from '@/types/Transaction';

interface TransactionsBodyProps {
  openCreateDialog: () => void;
}

const TransactionsBody = ({ openCreateDialog }: TransactionsBodyProps) => {
  const isSmallScreen = useIsSmallScreen();
  const {
    selectedMonth,
    selectedCategoryIds,
    selectedAccountIds,
    selectedPaymentMethodIds,
    selectedType,
  } = useTransactionPageData();
  const { control } = useFormContext<TransactionPageFormValues>();
  const searchValue = useWatch({ control, name: 'searchValue' });

  const { transactions, isLoading: isLoadingTransactions } = useTransactions(
    selectedMonth.year(),
    selectedMonth.month()
  );
  const { ghosts, isLoading: isLoadingGhosts } = useGhosts(selectedMonth.format('YYYY-MM'));
  const isLoading = isLoadingTransactions || isLoadingGhosts;

  const hasNoFiltersActive =
    !searchValue &&
    selectedType === 'All' &&
    selectedCategoryIds.length === 0 &&
    selectedAccountIds.length === 0 &&
    selectedPaymentMethodIds.length === 0;

  const isTrulyEmpty =
    !isLoading && transactions.length === 0 && ghosts.length === 0 && hasNoFiltersActive;

  if (isTrulyEmpty) {
    return (
      <>
        <TransactionsHeader />
        <TransactionsEmptyState onAddManual={openCreateDialog} />
      </>
    );
  }

  if (isSmallScreen) {
    return (
      <Column height={'100%'} minHeight={0} spacing={2}>
        <TransactionsHeader />
        <MobileTransactionsFilters />
        <TransactionsPreview />
      </Column>
    );
  }

  return (
    <>
      <TransactionsHeader />
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: '24px',
        }}
      >
        <TransactionsToolbar openCreateDialog={openCreateDialog} />
        <Column flex={1} minHeight={0} sx={{ overflow: 'auto' }}>
          <TransactionsPreview />
        </Column>
      </Paper>
    </>
  );
};

export const Transactions = () => {
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] = useOpen();
  const methods = useForm<TransactionPageFormValues>();

  usePrimaryAction(openCreateDialog);

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <TransactionPageDataProvider>
          <TransactionsBody openCreateDialog={openCreateDialog} />
          <TransactionDialogs
            isCreateDialogOpen={isCreateDialogOpen}
            closeCreateDialog={closeCreateDialog}
          />
        </TransactionPageDataProvider>
      </FormProvider>
    </PageLayout>
  );
};

export default Transactions;
