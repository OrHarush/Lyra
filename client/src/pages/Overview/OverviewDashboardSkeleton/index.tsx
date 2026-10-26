import { Grid } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import CategoriesBudgetSkeleton from '@/pages/Overview/BudgetsOverview/CategoryBudgetSkeleton';
import MoneyCalendarSkeleton from '@/pages/Overview/MoneyCalendar/MoneyCalendarSkeleton';
import MonthlyFinancialOverviewSkeleton from '@/pages/Overview/MonthlyFinancialOverview/MonthlyFinancialOverviewSkeleton';
import TopCategoriesChartSkeleton from '@/pages/Overview/TopSpendingCategories/TopCategoriesChartSkeleton';

const OverviewDashboardSkeleton = () => (
  <Column height={'100%'} minHeight={0} spacing={2} sx={{ flex: 1 }}>
    <Column height={'100%'} minHeight={0} spacing={4} sx={{ flex: 1 }}>
      <Grid container spacing={4} size={{ xs: 12 }}>
        <MonthlyFinancialOverviewSkeleton />
        <MoneyCalendarSkeleton />
      </Grid>
      <Grid
        container
        size={{ xs: 12 }}
        spacing={4}
        alignItems={'stretch'}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <CategoriesBudgetSkeleton />
        <TopCategoriesChartSkeleton />
      </Grid>
    </Column>
  </Column>
);

export default OverviewDashboardSkeleton;
