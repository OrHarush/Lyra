import { useInfiniteQuery } from '@tanstack/react-query';

import api from '@/api/axios';
import { queryKeys } from '@/constants/queryKeys';
import { ApiResponse } from '@/hooks/common/useFetch';
import { buildTransactionsUrl, TransactionsPageResponse } from '@/hooks/entities/useTransactions';
import { useAuth } from '@/providers/AuthProvider';
import { TrendSort } from '@/utils/entities/categoryTrends';

const PAGE_SIZE = 20;

export const useCategoryTransactions = (
  categoryId: string | undefined,
  month: string,
  sort: TrendSort
) => {
  const { user } = useAuth();
  const [year, monthNumber] = month.split('-').map(Number);

  const query = useInfiniteQuery({
    queryKey: queryKeys.categoryTransactions(categoryId ?? '', month, sort),
    initialPageParam: 1,
    enabled: !!user && !!categoryId,
    // Only a sort change may reuse the previous list; another category or month must show a skeleton
    // so the list never disagrees with the chart.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[3] === categoryId && previousQuery?.queryKey[4] === month
        ? previousData
        : undefined,
    queryFn: async ({ pageParam }) => {
      const url = buildTransactionsUrl(
        {
          year,
          month: monthNumber - 1,
          categoryIds: categoryId ? [categoryId] : undefined,
          type: 'Expense',
          sortBy: sort,
        },
        pageParam,
        PAGE_SIZE
      );
      const { data } = await api.get<ApiResponse<TransactionsPageResponse>>(url);

      return data.data;
    },
    getNextPageParam: lastPage =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  return {
    ...query,
    transactions: query.data?.pages.flatMap(page => page.data) ?? [],
  };
};
