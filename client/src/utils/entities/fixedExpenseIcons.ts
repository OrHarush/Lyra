import { BillType, SUBSCRIPTION_PROVIDERS, SubscriptionProviderCategory } from '@lyra/shared';

import arnonaIcon from '@/assets/fixedExpenses/arnona.webp';
import cloudIcon from '@/assets/fixedExpenses/cloud.webp';
import electricityIcon from '@/assets/fixedExpenses/electricity.webp';
import gasIcon from '@/assets/fixedExpenses/gas.webp';
import gymIcon from '@/assets/fixedExpenses/gym.webp';
import insuranceIcon from '@/assets/fixedExpenses/insurance.webp';
import internetIcon from '@/assets/fixedExpenses/internet.webp';
import mobileIcon from '@/assets/fixedExpenses/mobile.webp';
import musicIcon from '@/assets/fixedExpenses/music.webp';
import otherIcon from '@/assets/fixedExpenses/other.webp';
import tvIcon from '@/assets/fixedExpenses/tv.webp';
import waterIcon from '@/assets/fixedExpenses/water.webp';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { FixedExpenseGroupId, getFixedExpenseGroupId } from '@/utils/entities/fixedExpenseGroups';

// Imports only resolve to file URLs; the images download when an <img> using them renders.
export const FIXED_EXPENSE_ICON_URLS = {
  electricity: electricityIcon,
  water: waterIcon,
  gas: gasIcon,
  arnona: arnonaIcon,
  internet: internetIcon,
  mobile: mobileIcon,
  tv: tvIcon,
  music: musicIcon,
  insurance: insuranceIcon,
  gym: gymIcon,
  cloud: cloudIcon,
  other: otherIcon,
} as const;

export type FixedExpenseIconName = keyof typeof FIXED_EXPENSE_ICON_URLS;

export const BILL_TYPE_ICONS: Record<BillType, FixedExpenseIconName> = {
  electricity: 'electricity',
  water: 'water',
  arnona: 'arnona',
  gas: 'gas',
  other: 'other',
};

// News and dating have no fitting illustration, so they keep their category icon.
const PROVIDER_CATEGORY_ICONS: Partial<Record<SubscriptionProviderCategory, FixedExpenseIconName>> = {
  streaming: 'tv',
  music: 'music',
  tv: 'tv',
  mobile: 'mobile',
  internet: 'internet',
  cloud: 'cloud',
  ai: 'cloud',
  gym: 'gym',
};

export type FixedExpenseArtwork = FixedExpenseIconName | 'coin';

const GROUP_ARTWORK: Partial<Record<FixedExpenseGroupId, FixedExpenseArtwork>> = {
  housing: 'arnona',
  insurance: 'insurance',
  loans: 'coin',
};

export const GROUP_CARD_ARTWORK: Record<FixedExpenseGroupId, FixedExpenseArtwork> = {
  housing: 'arnona',
  loans: 'coin',
  subscriptions: 'tv',
  bills: 'electricity',
  insurance: 'insurance',
  other: 'other',
};

// Null means nothing more specific is known; callers show the expense's own category icon.
export const getFixedExpenseArtwork = (item: FixedExpenseDto): FixedExpenseArtwork | null => {
  if (item.kind === 'bill' && item.billType && item.billType !== 'other') {
    return BILL_TYPE_ICONS[item.billType];
  }

  const providerIcon = item.providerId
    ? PROVIDER_CATEGORY_ICONS[SUBSCRIPTION_PROVIDERS[item.providerId].category]
    : undefined;

  return providerIcon ?? GROUP_ARTWORK[getFixedExpenseGroupId(item)] ?? null;
};
