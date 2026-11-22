import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';

const SKELETON_ROW_COUNT = 5;

const InvestmentsSkeleton = () => (
  <Column spacing={2.5}>
    <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
    <Column spacing={1}>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={48} />
      ))}
    </Column>
  </Column>
);

export default InvestmentsSkeleton;
