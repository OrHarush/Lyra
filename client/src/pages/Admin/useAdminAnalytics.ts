import { useMemo } from 'react';

import { queryKeys } from '@/constants/queryKeys';
import { API_ROUTES } from '@/constants/Routes';
import { useFetch } from '@/hooks/common/useFetch';
import { AnalyticsOverviewDto } from '@/types/Admin';

export interface FunnelRow {
  labelKey: string;
  value: number;
  color: string;
}

export interface AdoptionRow {
  labelKey: string;
  value: number;
  color: string;
}

export const useAdminAnalytics = () => {
  const { data, isLoading, isError } = useFetch<AnalyticsOverviewDto>({
    url: `${API_ROUTES.ADMIN}/analytics`,
    queryKey: queryKeys.adminAnalytics(),
    refetchInterval: 60_000,
  });

  const funnel = useMemo((): FunnelRow[] => {
    if (!data) {
      return [];
    }

    return [
      { labelKey: 'funnel.signedUp', value: data.totalUsers, color: 'text.secondary' },
      { labelKey: 'funnel.onboarded', value: data.activatedUsers, color: 'info.main' },
      { labelKey: 'funnel.firstTx', value: data.usersWithTransactions, color: 'success.main' },
      { labelKey: 'funnel.recurringSet', value: data.eventCounts.recurring_created, color: 'warning.main' },
      { labelKey: 'funnel.pwaInstalled', value: data.eventCounts.pwa_installed ?? 0, color: 'secondary.main' },
    ];
  }, [data]);

  const adoption = useMemo((): AdoptionRow[] => {
    if (!data) {
      return [];
    }

    return [
      { labelKey: 'adoption.transactions', value: data.eventCounts.transaction_created, color: 'text.secondary' },
      { labelKey: 'adoption.recurring', value: data.eventCounts.recurring_created, color: 'info.main' },
      { labelKey: 'adoption.csvImport', value: data.eventCounts.csv_imported, color: 'warning.main' },
      { labelKey: 'adoption.customCategories', value: data.eventCounts.category_created, color: 'success.main' },
    ];
  }, [data]);

  const adoptionMax = useMemo(() => {
    if (!adoption.length) {
      return 1;
    }

    return Math.max(...adoption.map(r => r.value), 1);
  }, [adoption]);

  const funnelMax = useMemo(() => {
    if (!funnel.length) {
      return 1;
    }

    return Math.max(...funnel.map(step => step.value), 1);
  }, [funnel]);

  return {
    data,
    isLoading,
    isError,
    funnel,
    funnelMax,
    adoption,
    adoptionMax,
  };
};
