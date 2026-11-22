import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { useAuth } from '@/providers/AuthProvider';
import { TransactionDto, TransactionTotalsDto, TransactionTypeFilter } from '@/types/Transaction';

export interface TransactionsFilters {
  year: number;
  month: number;
  search?: string;
  categoryIds?: string[];
  accountIds?: string[];
  paymentMethodIds?: string[];
  type?: TransactionTypeFilter;
}

export interface TransactionsPageResponse {
  data: TransactionDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  totals: TransactionTotalsDto;
}

export const buildTransactionsUrl = (filters: TransactionsFilters, page: number, limit?: number) => {
  const { year, month, search, categoryIds, accountIds, paymentMethodIds, type = 'All' } = filters;

  const params = new URLSearchParams({
    year: year.toString(),
    month: (month + 1).toString(),
    page: page.toString(),
  });

  if (categoryIds?.length) {
    params.append('categoryIds', categoryIds.join(','));
  }

  if (accountIds?.length) {
    params.append('accountIds', accountIds.join(','));
  }

  if (paymentMethodIds?.length) {
    params.append('paymentMethodIds', paymentMethodIds.join(','));
  }

  if (limit !== undefined) {
    params.append('limit', limit.toString());
  }

  if (type !== 'All') {
    params.append('type', type);
  }

  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  return `${API_ROUTES.TRANSACTIONS}?${params.toString()}`;
};

export const useTransactions = (
  year?: number,
  month?: number,
  search?: string,
  categoryIds?: string[],
  accountIds?: string[],
  paymentMethodIds?: string[],
  page: number = 1,
  limit?: number,
  type: TransactionTypeFilter = 'All',
  isEnabled: boolean = true
) => {
  const { user } = useAuth();

  const today = new Date();
  const selectedYear = year ?? today.getFullYear();
  const selectedMonth = month ?? today.getMonth();

  const url = buildTransactionsUrl(
    {
      year: selectedYear,
      month: selectedMonth,
      search,
      categoryIds,
      accountIds,
      paymentMethodIds,
      type,
    },
    page,
    limit
  );

  const query = useFetch<TransactionsPageResponse>({
    url,
    queryKey: queryKeys.transactions({
      year: selectedYear,
      month: selectedMonth,
      categoryIds,
      accountIds,
      paymentMethodIds,
      page,
      limit,
      search,
      type: type === 'All' ? undefined : type,
    }),
    enabled: !!user && isEnabled,
  });

  return {
    ...query,
    transactions: query.data?.data ?? [],
    pagination: query.data?.pagination,
    totals: query.data?.totals,
  };
};
