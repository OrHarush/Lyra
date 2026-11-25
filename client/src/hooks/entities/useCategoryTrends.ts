import { CategoryTrendsResponse } from '@lyra/shared';

import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useAuth } from '@/providers/AuthProvider';

export const useCategoryTrends = (endMonth: string, months: number, accountId?: string) => {
  const { user } = useAuth();
  const params = new URLSearchParams({ endMonth, months: months.toString() });

  if (accountId) {
    params.append('accountId', accountId);
  }

  return useFetch<CategoryTrendsResponse>({
    url: `${API_ROUTES.CATEGORY_TRENDS}?${params.toString()}`,
    queryKey: queryKeys.categoryTrends(endMonth, months, accountId),
    enabled: !!user,
  });
};
