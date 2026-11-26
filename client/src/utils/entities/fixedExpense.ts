import { FixedExpenseKind, SUBSCRIPTION_PROVIDERS, SubscriptionProviderId } from '@lyra/shared';

import { FixedExpenseDto } from '@/types/FixedExpense';

export const getProviderName = (providerId: SubscriptionProviderId, language: string) => {
  const { name } = SUBSCRIPTION_PROVIDERS[providerId];

  return language.startsWith('he') ? name.he : name.en;
};

export const getProviderCancelUrl = (providerId?: SubscriptionProviderId | null) =>
  providerId ? SUBSCRIPTION_PROVIDERS[providerId].cancelUrl : undefined;

export const openCancellationPage = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const FIXED_EXPENSE_SECTION_ORDER: FixedExpenseKind[] = ['bill', 'subscription', 'regular'];

export const sumMonthlyByKind = (items: FixedExpenseDto[]) =>
  FIXED_EXPENSE_SECTION_ORDER.map(kind => ({
    kind,
    monthly: items
      .filter(item => item.kind === kind)
      .reduce((total, item) => total + item.monthlyAmount, 0),
  })).filter(({ monthly }) => monthly > 0);
