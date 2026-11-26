import { SUBSCRIPTION_PROVIDERS, SubscriptionProviderId } from '@lyra/shared';
import dayjs from 'dayjs';

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

export const sortByNextCharge = (items: FixedExpenseDto[]) =>
  [...items].sort((a, b) => a.nextDate.localeCompare(b.nextDate));

export const countDaysUntil = (isoDate: string) =>
  dayjs(isoDate.slice(0, 10)).startOf('day').diff(dayjs().startOf('day'), 'day');

// Likely subscriptions are asked about first, since marking them unlocks cancelling.
export const listUnclassified = (items: FixedExpenseDto[]) =>
  items
    .filter(item => item.kind === null)
    .sort(
      (a, b) =>
        Number(b.category?.key === 'subscriptions') - Number(a.category?.key === 'subscriptions')
    );
