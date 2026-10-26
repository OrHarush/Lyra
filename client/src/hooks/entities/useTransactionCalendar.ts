import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { CalendarDayDto } from '@/types/TransactionCalendar';

export const useTransactionCalendar = (year: number, month: number, accountId?: string) => {
  const query = useFetch<CalendarDayDto[]>({
    url: API_ROUTES.TRANSACTION_CALENDAR(year, month + 1, accountId),
    queryKey: queryKeys.transactionCalendar(year, month + 1, accountId ?? ''),
    enabled: !!accountId,
  });

  return { ...query, days: query.data ?? [] };
};
