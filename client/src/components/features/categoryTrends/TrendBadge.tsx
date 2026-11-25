import { TrendDelta } from '@lyra/shared';

import TrendChip from '@/components/shared/ui/TrendChip';
import { useTrendDeltaLabel } from '@/hooks/business/useTrendDeltaLabel';

interface TrendBadgeProps {
  delta: TrendDelta;
}

const TrendBadge = ({ delta }: TrendBadgeProps) => {
  const getLabel = useTrendDeltaLabel();
  const label = getLabel(delta);

  if (!label) {
    return null;
  }

  return <TrendChip direction={label.direction} label={label.text} tooltip={label.tooltip} />;
};

export default TrendBadge;
