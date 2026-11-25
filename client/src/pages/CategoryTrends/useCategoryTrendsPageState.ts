import dayjs from 'dayjs';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  isMonthKey,
  RANGE_OPTIONS,
  toMonthKey,
  TrendRange,
  TrendSort,
} from '@/utils/entities/categoryTrends';

const PARAMS = { category: 'category', month: 'month', range: 'range', sort: 'sort' } as const;

export const useCategoryTrendsPageState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth] = useState(() => toMonthKey(dayjs()));

  const monthParam = searchParams.get(PARAMS.month);
  const month = isMonthKey(monthParam) ? monthParam : currentMonth;
  const rangeParam = Number(searchParams.get(PARAMS.range));
  const range = RANGE_OPTIONS.find(option => option === rangeParam) ?? null;
  const sort: TrendSort = searchParams.get(PARAMS.sort) === 'date' ? 'date' : 'amount';
  const categoryId = searchParams.get(PARAMS.category);
  // Frozen so pills do not reshuffle under the user's thumb when they tap another month.
  const [orderMonth] = useState(month);

  // replace: one back gesture should leave the page, not undo every pill tap.
  const writeParams = (changes: Record<string, string>) =>
    setSearchParams(
      previous => {
        const next = new URLSearchParams(previous);

        Object.entries(changes).forEach(([key, value]) => next.set(key, value));

        return next;
      },
      { replace: true }
    );

  const selectCategory = (id: string) => writeParams({ [PARAMS.category]: id });
  const selectMonth = (period: string) => writeParams({ [PARAMS.month]: period });
  const selectSort = (next: TrendSort) => writeParams({ [PARAMS.sort]: next });
  const selectRange = (next: TrendRange, clampedMonth: string) =>
    writeParams({ [PARAMS.range]: String(next), [PARAMS.month]: clampedMonth });

  return {
    categoryId,
    month,
    range,
    sort,
    orderMonth,
    currentMonth,
    selectCategory,
    selectMonth,
    selectSort,
    selectRange,
  };
};

export type CategoryTrendsPageState = ReturnType<typeof useCategoryTrendsPageState>;
