import InsightsIcon from '@mui/icons-material/Insights';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import EmptyState from '@/components/shared/ui/EmptyState';
import CategoryDropdown from '@/pages/CategoryTrends/CategoryDropdown';
import CategoryPills from '@/pages/CategoryTrends/CategoryPills';
import CategoryTrendsEmpty from '@/pages/CategoryTrends/CategoryTrendsEmpty';
import CategoryTrendsError from '@/pages/CategoryTrends/CategoryTrendsError';
import CategoryTrendsSkeleton from '@/pages/CategoryTrends/CategoryTrendsSkeleton';
import MonthSummary from '@/pages/CategoryTrends/MonthSummary';
import RangeSwitch from '@/pages/CategoryTrends/RangeSwitch';
import TrendChart from '@/pages/CategoryTrends/TrendChart';
import TrendTransactions from '@/pages/CategoryTrends/TrendTransactions';
import { useCategoryTrendsPage } from '@/pages/CategoryTrends/useCategoryTrendsPage';
import { MAX_PILLS_WITHOUT_DROPDOWN } from '@/utils/entities/categoryTrends';

const CategoryTrends = () => {
  const { t } = useTranslation('categoryTrends');
  const page = useCategoryTrendsPage();
  const { state, trends, view, pills } = page;

  if (trends.isError) {
    return (
      <PageLayout hasNaturalHeight>
        <CategoryTrendsError message={t('error.trends')} onRetry={() => trends.refetch()} />
      </PageLayout>
    );
  }

  if (trends.isLoading || !view) {
    return (
      <PageLayout hasNaturalHeight>
        <CategoryTrendsSkeleton />
      </PageLayout>
    );
  }

  if (!page.hasAnySpend) {
    return (
      <PageLayout hasNaturalHeight>
        <CategoryTrendsEmpty />
      </PageLayout>
    );
  }

  const hasManyCategories = pills.length > MAX_PILLS_WITHOUT_DROPDOWN;
  const pillsAriaLabel = t('pills.ariaLabel');

  return (
    <PageLayout hasNaturalHeight spacing={3}>
      <Column spacing={1.5}>
        {hasManyCategories && (
          <CategoryDropdown
            pills={pills}
            selectedId={view.selectedId}
            onSelect={state.selectCategory}
            ariaLabel={t('pills.jumpTo')}
          />
        )}
        <CategoryPills
          pills={pills}
          selectedId={view.selectedId}
          onSelect={state.selectCategory}
          ariaLabel={pillsAriaLabel}
        />
      </Column>

      {page.selectedHasSpend ? (
        <Column spacing={2}>
          <Row alignItems="flex-start" justifyContent="space-between" columnGap={2} rowGap={1} flexWrap="wrap">
            <MonthSummary period={view.selectedMonth} entry={page.selectedEntry} />
            <RangeSwitch value={view.range} onChange={page.selectRange} />
          </Row>
          <Typography variant="subtitle2" color="text.secondary">
            {page.selectedName} · {t('chart.title')}
          </Typography>
          <TrendChart
            rows={page.chartRows}
            selectedPeriod={view.selectedMonth}
            color={view.selected?.color}
            onSelectMonth={state.selectMonth}
          />
        </Column>
      ) : (
        <EmptyState
          icon={InsightsIcon}
          title={t('categoryEmpty.title')}
          description={t('categoryEmpty.description')}
        />
      )}

      {page.selectedHasSpend && (
        <TrendTransactions
          categoryId={view.selectedId}
          month={view.selectedMonth}
          sort={state.sort}
          onSortChange={state.selectSort}
        />
      )}
    </PageLayout>
  );
};

export default CategoryTrends;
