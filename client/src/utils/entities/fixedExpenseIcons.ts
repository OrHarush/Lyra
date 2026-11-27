import { BillType } from '@lyra/shared';

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
import { FixedExpenseGroupId } from '@/utils/entities/fixedExpenseGroups';

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

export type FixedExpenseArtwork = FixedExpenseIconName | 'coin';

export const GROUP_CARD_ARTWORK: Record<FixedExpenseGroupId, FixedExpenseArtwork> = {
  housing: 'arnona',
  loans: 'coin',
  subscriptions: 'tv',
  bills: 'electricity',
  insurance: 'insurance',
};
