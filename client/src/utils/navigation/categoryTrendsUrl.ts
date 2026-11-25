import { Dayjs } from 'dayjs';

import { ROUTES } from '@/constants/Routes';

export const buildCategoryTrendsUrl = (month: Dayjs, categoryId?: string): string => {
  const params = new URLSearchParams({ month: month.format('YYYY-MM') });

  if (categoryId) {
    params.set('category', categoryId);
  }

  return `${ROUTES.CATEGORY_TRENDS_URL}?${params.toString()}`;
};
