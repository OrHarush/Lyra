import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import TrendTransactionsSkeleton from '@/pages/CategoryTrends/TrendTransactionsSkeleton';

const PILL_WIDTHS = [96, 120, 84, 110, 90];

const CategoryTrendsSkeleton = () => (
  <Column spacing={3}>
    <Row spacing={1} sx={{ overflow: 'hidden' }}>
      {PILL_WIDTHS.map(width => (
        <Skeleton key={width} variant="rounded" width={width} height={32} sx={{ flexShrink: 0 }} />
      ))}
    </Row>
    <Column spacing={1}>
      <Skeleton variant="text" width={120} />
      <Skeleton variant="text" width={180} height={48} />
    </Column>
    <Skeleton variant="rounded" height={260} />
    <TrendTransactionsSkeleton />
  </Column>
);

export default CategoryTrendsSkeleton;
