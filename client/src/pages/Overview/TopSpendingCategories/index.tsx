import { TrendDelta } from '@lyra/shared';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCategories } from '@/hooks/entities/useCategories';
import { useCategoryTrends } from '@/hooks/entities/useCategoryTrends';
import { useTransactions } from '@/hooks/entities/useTransactions';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import EmptyCategoriesChart from '@/pages/Overview/TopSpendingCategories/EmptyCategoriesChart';
import TopCategoriesChart from '@/pages/Overview/TopSpendingCategories/TopCategoriesChart';
import { getTopSpendingCategories } from '@/utils/entities/category';
import { toMonthKey } from '@/utils/entities/categoryTrends';
import { buildCategoryTrendsUrl } from '@/utils/navigation/categoryTrendsUrl';

const MAX_ITEMS = 5;
const MONTHS_NEEDED_FOR_DELTA = 2;

const TopSpendingCategories = () => {
  const { date, year, month } = useOverviewFilters();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { transactions, isLoading: isTransactionsLoading } = useTransactions(year, month);
  const { data: trends } = useCategoryTrends(toMonthKey(date), MONTHS_NEEDED_FOR_DELTA);
  const navigate = useNavigate();
  const isLoading = isCategoriesLoading || isTransactionsLoading;

  const chartData = useMemo(() => {
    if (!categories || !transactions) {
      return [];
    }

    return getTopSpendingCategories(transactions, categories, MAX_ITEMS);
  }, [categories, transactions]);

  const deltas = useMemo(() => {
    const byCategory: Record<string, TrendDelta> = {};

    trends?.categories.forEach(category => {
      const selectedMonth = category.months.find(entry => entry.period === toMonthKey(date));

      if (selectedMonth) {
        byCategory[category.categoryId] = selectedMonth.delta;
      }
    });

    return byCategory;
  }, [trends, date]);

  const openCategoryTrends = (categoryId: string) => {
    navigate(buildCategoryTrendsUrl(date, categoryId));
  };

  const openAllCategoryTrends = () => {
    navigate(buildCategoryTrendsUrl(date));
  };

  if (chartData.length === 0 && !isLoading) {
    return <EmptyCategoriesChart />;
  }

  return (
    <TopCategoriesChart
      chartData={chartData}
      deltas={deltas}
      isLoading={isLoading}
      onBarClick={openCategoryTrends}
      onViewAll={openAllCategoryTrends}
    />
  );
};

export default TopSpendingCategories;
