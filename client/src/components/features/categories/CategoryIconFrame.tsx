import { Box } from '@mui/material';
import { ElementType } from 'react';

import { categoryIconMap } from '@/constants/categoryIconMap';

export type CategoryIconFrameSize = 'small' | 'medium';

interface CategoryIconFrameProps {
  color?: string;
  icon?: string;
  size?: CategoryIconFrameSize;
}

const FRAME_DIMENSIONS = {
  small: { frame: 28, icon: 16, radius: '8px' },
  medium: { frame: 40, icon: 20, radius: '12px' },
} as const;

const DEFAULT_ICON = 'Category';

const resolveIcon = (icon?: string): ElementType =>
  (icon && categoryIconMap[icon]) || categoryIconMap[DEFAULT_ICON];

const CategoryIconFrame = ({
  color = '#9ca3af',
  icon,
  size = 'medium',
}: CategoryIconFrameProps) => {
  const IconComponent = resolveIcon(icon);
  const { frame, icon: iconSize, radius } = FRAME_DIMENSIONS[size];

  return (
    <Box
      sx={{
        backgroundColor: `${color}20`,
        borderRadius: radius,
        width: frame,
        minWidth: frame,
        height: frame,
        minHeight: frame,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <IconComponent sx={{ color, fontSize: iconSize }} />
    </Box>
  );
};

export default CategoryIconFrame;
