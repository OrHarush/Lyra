import { CategoryTrend, CategoryTrendsResponse, TrendDelta } from '@lyra/shared';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import { useCategoryTrendsViewTracking } from '@/hooks/analytics/useCategoryTrendsViewTracking';
import { useCategories } from '@/hooks/entities/useCategories';
import { useCategoryTrends } from '@/hooks/entities/useCategoryTrends';
import { useCategoryTrendsPageState } from '@/pages/CategoryTrends/useCategoryTrendsPageState';
import { getCategoryDisplayName } from '@/utils/entities/category';
import {
  buildChartRows,
  buildPlaceholderTrend,
  clampMonth,
  defaultRangeFor,
  findMonthEntry,
  sortCategoriesForMonth,
  TrendRange,
} from '@/utils/entities/categoryTrends';

const TRENDS_MONTHS = 12;

export interface TrendPill {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  delta: TrendDelta;
}

const buildView = (
  data: CategoryTrendsResponse,
  state: ReturnType<typeof useCategoryTrendsPageState>,
  fallbackCategory: CategoryTrend | undefined
) => {
  const { periods } = data;
  const ordered = sortCategoriesForMonth(data.categories, clampMonth(state.orderMonth, periods));
  const selectedId = state.categoryId ?? ordered[0]?.categoryId;
  const selected =
    ordered.find(category => category.categoryId === selectedId) ?? fallbackCategory;
  const month = clampMonth(state.month, periods);
  const range: TrendRange = state.range ?? defaultRangeFor(month, periods);
  const visiblePeriods = periods.slice(-range);
  const selectedMonth = clampMonth(month, visiblePeriods);

  return { ordered, selectedId, selected, selectedMonth, range, visiblePeriods, periods };
};

export const useCategoryTrendsPage = () => {
  const { t } = useTranslation('categoryTrends');
  const { t: tCategories } = useTranslation('categories');
  const state = useCategoryTrendsPageState();
  const trends = useCategoryTrends(state.currentMonth, TRENDS_MONTHS);
  const { categories } = useCategories();

  usePageHeader(t('pageTitle'));
  useCategoryTrendsViewTracking();

  const view = useMemo(() => {
    if (!trends.data) {
      return null;
    }

    const knownCategory = categories.find(category => category._id === state.categoryId);
    const fallbackCategory = knownCategory
      ? buildPlaceholderTrend(
          {
            categoryId: knownCategory._id,
            name: knownCategory.name,
            key: knownCategory.key,
            color: knownCategory.color,
            icon: knownCategory.icon,
          },
          trends.data.periods
        )
      : undefined;

    return buildView(trends.data, state, fallbackCategory);
    // state is rebuilt on every render; its primitives are the real dependencies.
  }, [trends.data, categories, state.categoryId, state.month, state.range, state.orderMonth]);

  const pills: TrendPill[] = useMemo(
    () =>
      view?.ordered.map(category => ({
        id: category.categoryId,
        name: getCategoryDisplayName(category, tCategories),
        color: category.color,
        icon: category.icon,
        delta: findMonthEntry(category, view.selectedMonth)?.delta ?? {
          kind: 'none',
          absolute: 0,
          basis: 'fullMonth',
        },
      })) ?? [],
    [view, tCategories]
  );

  const chartRows = useMemo(
    () => (view?.selected ? buildChartRows(view.selected, view.visiblePeriods) : []),
    [view]
  );

  const selectedEntry = view?.selected
    ? findMonthEntry(view.selected, view.selectedMonth)
    : undefined;
  const hasAnySpend = (trends.data?.categories.length ?? 0) > 0;
  const selectedHasSpend = view?.selected?.months.some(entry => entry.total > 0) ?? false;

  useEffect(() => {
    if (!state.categoryId && view?.selectedId) {
      state.selectCategory(view.selectedId);
    }
  }, [state.categoryId, view?.selectedId]);

  const selectRange = (next: TrendRange) => {
    const nextPeriods = view?.periods.slice(-next) ?? [];

    state.selectRange(next, clampMonth(view?.selectedMonth ?? state.month, nextPeriods));
  };

  return {
    state,
    trends,
    view,
    pills,
    chartRows,
    selectedEntry,
    hasAnySpend,
    selectedHasSpend,
    selectedName: view?.selected ? getCategoryDisplayName(view.selected, tCategories) : '',
    selectRange,
  };
};
