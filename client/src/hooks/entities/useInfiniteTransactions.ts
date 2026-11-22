import { useInfiniteQuery } from '@tanstack/react-query';

import api from '@/api/axios';
import { ApiResponse } from '@/hooks/common/useFetch';
import {
  buildTransactionsUrl,
  TransactionsFilters,
  TransactionsPageResponse,
} from '@/hooks/entities/useTransactions';
import { useAuth } from '@/providers/AuthProvider';

const PAGE_SIZE = 20;

export const useInfiniteTransactions = (filters: TransactionsFilters, isEnabled: boolean) => {
  const { user } = useAuth();

  const query = useInfiniteQuery({
    // Nested under 'transactions' so every create/edit/delete invalidation refreshes it too.
    queryKey: ['transactions', 'infinite', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data: response } = await api.get<ApiResponse<TransactionsPageResponse>>(
        buildTransactionsUrl(filters, pageParam, PAGE_SIZE)
      );

      return response.data;
    },
    getNextPageParam: lastPage =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!user && isEnabled,
  });

  const pages = query.data?.pages ?? [];

  return {
    transactions: pages.flatMap(page => page.data),
    totals: pages[0]?.totals,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};
