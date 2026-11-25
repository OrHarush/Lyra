import { Card, CardContent, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { useSortedBudgetCategories } from '@/hooks/business/useSortedBudgetCategories';
import { useIsMobile } from '@/hooks/common/useIsMobile';
import { useBudgets } from '@/hooks/entities/useBudgets';
import { useCategories } from '@/hooks/entities/useCategories';
import { useTransactions } from '@/hooks/entities/useTransactions';
import BudgetList from '@/pages/Overview/BudgetsOverview/BudgetList';
import CategoriesBudgetSkeleton from '@/pages/Overview/BudgetsOverview/CategoryBudgetSkeleton';
import NoBudgetsEmptyCTA from '@/pages/Overview/BudgetsOverview/NoBudgetsEmptyCTA';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import { DASHBOARD_CARD_PADDING } from '@/pages/Overview/styles';

const BudgetsOverview = () => {
  const { t } = useTranslation('overview');
  const isMobile = useIsMobile();
  const { year, month } = useOverviewFilters();
  const { categories, isLoading: isLoadingCategories } = useCategories();
  const { transactions, isLoading: isLoadingTransactions } = useTransactions(year, month);
  const { budgets, isLoading: isLoadingBudgets } = useBudgets(year, month);

  const isLoading = isLoadingCategories || isLoadingTransactions || isLoadingBudgets;

  const sortedBudgets = useSortedBudgetCategories(categories, transactions, budgets);

  if (isLoading) {
    return <CategoriesBudgetSkeleton />;
  }

  return (
    <Grid size={{ xs: 12, md: 6, lg: 4 }} sx={{ display: 'flex', minHeight: 0 }}>
      <Card sx={{ height: '100%', display: 'flex', flex: 1, minHeight: 0 }}>
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flex: 1,
            minHeight: 0,
            p: DASHBOARD_CARD_PADDING,
            '&:last-child': {
              pb: DASHBOARD_CARD_PADDING,
            },
          }}
        >
          <Column height={'100%'} spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Typography variant="h5" color="text.primary" align={isMobile ? 'center' : undefined}>
              {t('budgetWatch.title')}
            </Typography>
            {sortedBudgets.length === 0 ? (
              <NoBudgetsEmptyCTA />
            ) : (
              <BudgetList budgets={sortedBudgets} />
            )}
          </Column>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default BudgetsOverview;
