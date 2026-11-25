import InsightsIcon from '@mui/icons-material/Insights';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import PageLayout from '@/components/shared/layout/page/PageLayout';
import EmptyState from '@/components/shared/ui/EmptyState';
import CategoryPills from '@/pages/CategoryTrends/CategoryPills';
import CategoryTrendsEmpty from '@/pages/CategoryTrends/CategoryTrendsEmpty';
import CategoryTrendsError from '@/pages/CategoryTrends/CategoryTrendsError';
import CategoryTrendsSkeleton from '@/pages/CategoryTrends/CategoryTrendsSkeleton';
import MonthSummary from '@/pages/CategoryTrends/MonthSummary';
import RangeSwitch from '@/pages/CategoryTrends/RangeSwitch';
import TrendChart from '@/pages/CategoryTrends/TrendChart';
import TrendTransactions from '@/pages/CategoryTrends/TrendTransactions';
import { useCategoryTrendsPage } from '@/pages/CategoryTrends/useCategoryTrendsPage';

const CategoryTrends = () => {
  const { t } = useTranslation('categoryTrends');
  const theme = useTheme();
  const isStacked = useMediaQuery(theme.breakpoints.down('md'));
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

  // The chart sits on the physical left in both languages, so RTL reverses the DOM order.
  const panelsDirection = theme.direction === 'rtl' ? 'row-reverse' : 'row';

  return (
    <PageLayout hasNaturalHeight={isStacked} spacing={3}>
      <CategoryPills
        pills={pills}
        selectedId={view.selectedId}
        onSelect={state.selectCategory}
        ariaLabel={t('pills.ariaLabel')}
      />

      {page.selectedHasSpend ? (
        <Row
          columnGap={{ md: 4 }}
          rowGap={3}
          sx={{
            flex: 1,
            minHeight: 0,
            flexDirection: { xs: 'column', md: panelsDirection },
          }}
        >
          <Column spacing={2} sx={{ flex: { md: 3 }, minWidth: 0, minHeight: 0 }}>
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
          <Column sx={{ flex: { md: 2 }, minWidth: 0, minHeight: 0 }}>
            <TrendTransactions
              categoryId={view.selectedId}
              month={view.selectedMonth}
              sort={state.sort}
              onSortChange={state.selectSort}
            />
          </Column>
        </Row>
      ) : (
        <EmptyState
          icon={InsightsIcon}
          title={t('categoryEmpty.title')}
          description={t('categoryEmpty.description')}
        />
      )}
    </PageLayout>
  );
};

export default CategoryTrends;
