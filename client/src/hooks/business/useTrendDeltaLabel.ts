import { TrendDelta } from '@lyra/shared';
import { useTranslation } from 'react-i18next';

import { TrendDirection } from '@/components/shared/ui/trendColor';
import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency } from '@/utils/currency';

export interface TrendDeltaLabel {
  text: string;
  compactText: string;
  direction: TrendDirection;
  tooltip: string;
}

export const useTrendDeltaLabel = () => {
  const { t } = useTranslation('categoryTrends');
  const { user } = useAuth();
  const currency = user?.displayCurrency ?? 'ILS';

  return (delta: TrendDelta): TrendDeltaLabel | null => {
    const tooltip =
      delta.basis === 'monthToDate' ? t('tooltip.vsSamePoint') : t('tooltip.vsLastMonth');

    if (delta.kind === 'new') {
      return {
        text: t('delta.new'),
        compactText: t('delta.new'),
        direction: 'neutral',
        tooltip,
      };
    }

    if (delta.kind === 'percent' && delta.percent !== undefined) {
      const isHigher = delta.percent > 0;

      return {
        text: t(isHigher ? 'delta.higher' : 'delta.lower', { percent: Math.abs(delta.percent) }),
        compactText: `${isHigher ? '↑' : '↓'}${Math.abs(delta.percent)}%`,
        direction: isHigher ? 'up' : 'down',
        tooltip,
      };
    }

    if (delta.kind === 'smallBase') {
      const isHigher = delta.absolute > 0;
      const amount = formatCurrency(Math.abs(delta.absolute), currency);

      return {
        text: t(isHigher ? 'delta.higherBy' : 'delta.lowerBy', { amount }),
        compactText: `${isHigher ? '↑' : '↓'}${amount}`,
        direction: isHigher ? 'up' : 'down',
        tooltip,
      };
    }

    return null;
  };
};
