import { TrendDelta } from '@lyra/shared';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useTheme } from '@mui/material';

import { getTrendColor } from '@/components/shared/ui/trendColor';
import { useTrendDeltaLabel } from '@/hooks/business/useTrendDeltaLabel';

interface TrendArrowProps {
  delta: TrendDelta;
}

const ARROW_SIZE = 14;
const DOT_SIZE = 8;

const TrendArrow = ({ delta }: TrendArrowProps) => {
  const theme = useTheme();
  const getLabel = useTrendDeltaLabel();
  const label = getLabel(delta);

  if (!label) {
    return null;
  }

  const color = getTrendColor(label.direction, theme);

  if (label.direction === 'neutral') {
    return <FiberManualRecordIcon sx={{ fontSize: DOT_SIZE, color }} />;
  }

  const Icon = label.direction === 'up' ? ArrowUpwardIcon : ArrowDownwardIcon;

  return <Icon sx={{ fontSize: ARROW_SIZE, color }} />;
};

export default TrendArrow;
