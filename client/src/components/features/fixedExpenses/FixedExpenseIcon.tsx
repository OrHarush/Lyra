import { Box, Skeleton } from '@mui/material';
import { useState } from 'react';

import {
  getIconBoxStyle,
  getIconImageStyle,
  getIconSkeletonStyle,
} from '@/components/features/fixedExpenses/styles';
import { FIXED_EXPENSE_ICON_URLS, FixedExpenseIconName } from '@/utils/entities/fixedExpenseIcons';

interface FixedExpenseIconProps {
  name: FixedExpenseIconName;
  size: number;
}

const FixedExpenseIcon = ({ name, size }: FixedExpenseIconProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // A cached image can finish before React attaches onLoad, so check once it mounts.
  const markLoadedIfCached = (image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setIsLoaded(true);
    }
  };

  return (
    <Box sx={getIconBoxStyle(size)}>
      {!isLoaded && <Skeleton variant="circular" sx={getIconSkeletonStyle()} />}
      <Box
        component="img"
        ref={markLoadedIfCached}
        src={FIXED_EXPENSE_ICON_URLS[name]}
        alt=""
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        sx={getIconImageStyle(isLoaded)}
      />
    </Box>
  );
};

export default FixedExpenseIcon;
