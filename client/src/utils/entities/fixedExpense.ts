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

const SPLIT_ORDER: FixedExpenseKind[] = ['bill', 'subscription', 'regular'];

// Unclassified expenses count as "other" in the monthly split.
export const sumMonthlyByKind = (items: FixedExpenseDto[]) =>
  SPLIT_ORDER.map(kind => ({
    kind,
    monthly: items
      .filter(item => (item.kind ?? 'regular') === kind)
      .reduce((total, item) => total + item.monthlyAmount, 0),
  })).filter(({ monthly }) => monthly > 0);

export const isMostlyUnclassified = (items: FixedExpenseDto[]) =>
  items.filter(item => item.kind === null).length * 2 > items.length;

export const sortByNextCharge = (items: FixedExpenseDto[]) =>
  [...items].sort((a, b) => a.nextDate.localeCompare(b.nextDate));
