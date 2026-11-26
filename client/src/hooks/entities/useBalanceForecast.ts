import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { AccountDto } from '@/types/Account';
import { BalanceForecastDto } from '@/types/BalanceForecast';

// `month` is 1-based, matching the API.
export const useBalanceForecast = (
  year: number,
  month: number,
  account: AccountDto | undefined,
  enabled: boolean
) =>
  useFetch<BalanceForecastDto>({
    url: account ? API_ROUTES.ACCOUNT_FORECAST(account._id, year, month) : '',
    queryKey: account ? queryKeys.balanceForecast(year, month, account) : ['transactionSummary'],
    enabled: enabled && !!account,
  });
