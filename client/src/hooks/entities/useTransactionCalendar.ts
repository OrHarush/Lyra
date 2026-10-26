import { Dayjs } from 'dayjs';

import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { TransactionCalendarDto } from '@/types/TransactionCalendar';
import { getVisibleRange } from '@/utils/entities/calendar';

export const useTransactionCalendar = (month: Dayjs, accountId?: string) => {
  const { start, end } = getVisibleRange(month);
  const from = start.format('YYYY-MM-DD');
  const to = end.format('YYYY-MM-DD');

  const query = useFetch<TransactionCalendarDto>({
    url: API_ROUTES.TRANSACTION_CALENDAR(from, to, accountId),
    queryKey: queryKeys.transactionCalendar(from, to, accountId ?? ''),
    enabled: !!accountId,
  });

  return { ...query, days: query.data?.days ?? [], upcoming: query.data?.upcoming ?? [] };
};
