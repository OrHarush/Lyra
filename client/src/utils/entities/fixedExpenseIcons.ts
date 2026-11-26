import {
  BillType,
  DefaultCategoryKey,
  SUBSCRIPTION_PROVIDERS,
  SubscriptionProviderCategory,
} from '@lyra/shared';

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

const PROVIDER_CATEGORY_ICONS: Record<SubscriptionProviderCategory, FixedExpenseIconName> = {
  streaming: 'tv',
  music: 'music',
  tv: 'tv',
  mobile: 'mobile',
  internet: 'internet',
  cloud: 'cloud',
  ai: 'cloud',
  news: 'other',
  dating: 'other',
  gym: 'gym',
};

const CATEGORY_KEY_ICONS: Partial<Record<DefaultCategoryKey, FixedExpenseIconName>> = {
  housing: 'arnona',
  utilities: 'electricity',
  insurance: 'insurance',
  subscriptions: 'tv',
};

// Null means the expense has no matching illustration; callers fall back to its category icon.
export const getFixedExpenseIcon = (item: FixedExpenseDto): FixedExpenseIconName | null => {
  if (item.kind === 'bill') {
    return BILL_TYPE_ICONS[item.billType ?? 'other'];
  }

  if (item.providerId) {
    return PROVIDER_CATEGORY_ICONS[SUBSCRIPTION_PROVIDERS[item.providerId].category];
  }

  const categoryIcon = item.category?.key ? CATEGORY_KEY_ICONS[item.category.key] : undefined;

  if (categoryIcon) {
    return categoryIcon;
  }

  return item.kind === 'subscription' ? 'other' : null;
};
