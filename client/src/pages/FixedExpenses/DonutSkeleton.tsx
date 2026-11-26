import { Skeleton } from '@mui/material';

import { getDonutSkeletonStyle } from '@/pages/FixedExpenses/styles';

const DonutSkeleton = ({ size }: { size: number }) => (
  <Skeleton variant="circular" width={size} height={size} sx={getDonutSkeletonStyle()} />
);

export default DonutSkeleton;
