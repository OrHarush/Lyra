import { UpdateFixedExpenseDetailsDTO } from '@lyra/shared';

import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useApiMutation } from '@/hooks/useApiMutation';
import { FixedExpenseListDto } from '@/types/FixedExpense';

// Stopping an expense records occurrences already due, which moves balances and totals.
const KEYS_TO_REFRESH = [
  queryKeys.allTransactions(),
  ['transactionSummary'],
  queryKeys.accounts(),
];

export const useFixedExpenses = () => {
  const query = useFetch<FixedExpenseListDto>({
    url: API_ROUTES.FIXED_EXPENSES,
    queryKey: queryKeys.fixedExpenses(),
  });

  return { ...query, fixedExpenses: query.data };
};

export const useCancelFixedExpense = () =>
  useApiMutation<unknown, { id: string }>({
    method: 'post',
    buildUrl: ({ id }) => API_ROUTES.FIXED_EXPENSE_CANCEL(id),
    queryKeysToInvalidate: KEYS_TO_REFRESH,
  });

export const useUpdateFixedExpenseDetails = () =>
  useApiMutation<unknown, UpdateFixedExpenseDetailsDTO & { id: string }>({
    method: 'put',
    buildUrl: ({ id }) => API_ROUTES.FIXED_EXPENSE_DETAILS(id),
    queryKeysToInvalidate: [queryKeys.fixedExpenses()],
  });
