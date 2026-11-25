import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Chip, Tooltip, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { getTrendColor, TrendDirection } from '@/components/shared/ui/trendColor';

interface TrendChipProps {
  direction: TrendDirection;
  label: ReactNode;
  tooltip: string;
}

const TrendChip = ({ direction, label, tooltip }: TrendChipProps) => {
  const theme = useTheme();
  const color = getTrendColor(direction, theme);
  const Icon = direction === 'up' ? TrendingUpIcon : TrendingDownIcon;
  const icon =
    direction === 'neutral' ? undefined : (
      <Icon sx={{ fontSize: '0.85rem !important', color: `${color} !important` }} />
    );

  return (
    <Tooltip title={tooltip} placement="top">
      <Chip
        icon={icon}
        label={<span dir="ltr">{label}</span>}
        size="small"
        onClick={e => e.stopPropagation()}
        sx={{
          height: 22,
          maxWidth: '100%',
          fontSize: '0.7rem',
          fontWeight: 700,
          backgroundColor: `${color}18`,
          color,
          border: 'none',
          cursor: 'default',
          '& .MuiChip-icon': { ml: 0.5 },
        }}
      />
    </Tooltip>
  );
};

export default TrendChip;
