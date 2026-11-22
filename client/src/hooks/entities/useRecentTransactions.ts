import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { ExpandedTransactionDto } from '@/types/Transaction';

export const useRecentTransactions = (accountId: string | undefined, limit: number) => {
  const query = useFetch<{ data: ExpandedTransactionDto[] }>({
    url: API_ROUTES.TRANSACTIONS_RECENT(accountId ?? '', limit),
    queryKey: queryKeys.recentTransactions(accountId ?? '', limit),
    enabled: !!accountId,
  });

  return { ...query, transactions: query.data?.data ?? [] };
};
