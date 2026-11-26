import { ApproveBillDTO } from '@lyra/shared';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useApiMutation } from '@/hooks/useApiMutation';
import { PendingBillDto } from '@/types/Bill';

export const usePendingBills = () => {
  const query = useFetch<PendingBillDto[]>({
    url: API_ROUTES.PENDING_BILLS,
    queryKey: queryKeys.pendingBills(),
    staleTime: 0,
  });

  return { ...query, pendingBills: query.data ?? [] };
};

export const useApproveBill = () => {
  const queryClient = useQueryClient();
  const keysToRefresh = [
    queryKeys.allTransactions(),
    ['transactionSummary'],
    queryKeys.accounts(),
    ['budgets'],
  ];

  return useApiMutation<unknown, ApproveBillDTO & { transactionId: string }>({
    method: 'post',
    buildUrl: ({ transactionId }) => API_ROUTES.BILL_APPROVE(transactionId),
    queryKeysToInvalidate: keysToRefresh,
    options: {
      // A rejected approval usually means someone else handled the bill, so the lists are stale.
      onError: () => {
        keysToRefresh.forEach(queryKey => queryClient.invalidateQueries({ queryKey }));
      },
    },
  });
};
