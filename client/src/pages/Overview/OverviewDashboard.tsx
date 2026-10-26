import { Grid } from '@mui/material';
import { useCallback, useState } from 'react';

import CreateTransactionDialog from '@/components/features/transactions/CreateTransactionDialog';
import Column from '@/components/shared/layout/containers/Column';
import { usePrimaryAction } from '@/components/shared/layout/PageHeaderContext';
import ActionFab from '@/components/shared/ui/ActionFab';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useOpen } from '@/hooks/common/useOpen';
import BudgetsOverview from '@/pages/Overview/BudgetsOverview';
import MoneyCalendar from '@/pages/Overview/MoneyCalendar';
import MonthlyFinancialOverview from '@/pages/Overview/MonthlyFinancialOverview';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import OverviewHeader from '@/pages/Overview/OverviewHeader';
import RecurringSetupBanner from '@/pages/Overview/RecurringSetupBanner';
import ReviewTransactionsBanner from '@/pages/Overview/ReviewTransactionsBanner';
import TopSpendingCategories from '@/pages/Overview/TopSpendingCategories';

const OverviewDashboard = () => {
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] = useOpen();
  const [initialAccountId, setInitialAccountId] = useState<string | undefined>();
  const { account } = useOverviewFilters();
  const isSmallScreen = useIsSmallScreen();

  const openCreateTransaction = useCallback(() => {
    setInitialAccountId(account?._id);
    openCreateDialog();
  }, [account?._id, openCreateDialog]);

  usePrimaryAction(openCreateTransaction);

  return (
    <Column height={'100%'} minHeight={0} spacing={2} sx={{ flex: 1 }}>
      <OverviewHeader />
      <Column height={'100%'} minHeight={0} spacing={4} sx={{ flex: 1 }}>
        <ReviewTransactionsBanner />
        <RecurringSetupBanner />
        <Grid container spacing={4} size={{ xs: 12 }}>
          <MonthlyFinancialOverview />
          <MoneyCalendar />
        </Grid>
        <Grid
          container
          size={{ xs: 12 }}
          spacing={4}
          alignItems={'stretch'}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <BudgetsOverview />
          <TopSpendingCategories />
        </Grid>
      </Column>
      {!isSmallScreen && <ActionFab onClick={openCreateTransaction} />}
      {isCreateDialogOpen && (
        <CreateTransactionDialog
          isOpen={isCreateDialogOpen}
          closeDialog={closeCreateDialog}
          initialAccountId={initialAccountId}
        />
      )}
    </Column>
  );
};

export default OverviewDashboard;
