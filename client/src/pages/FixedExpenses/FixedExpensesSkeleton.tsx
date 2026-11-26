import { Card, Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const SKELETON_ROWS = 4;

const FixedExpensesSkeleton = () => (
  <Column spacing={2.5}>
    <Card sx={{ p: { xs: 2, sm: 3 } }}>
      <Row spacing={4}>
        <Column spacing={0.5}>
          <Skeleton width={70} />
          <Skeleton width={140} height={44} />
        </Column>
        <Column spacing={0.5}>
          <Skeleton width={70} />
          <Skeleton width={120} height={36} />
        </Column>
      </Row>
    </Card>
    <Column spacing={1}>
      <Skeleton width={120} height={32} />
      <Card sx={{ px: 2, py: 0.5 }}>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Row key={index} alignItems="center" spacing={1.5} sx={{ py: 1.5 }}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Column spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton width="40%" />
              <Skeleton width="60%" />
            </Column>
            <Skeleton width={60} />
          </Row>
        ))}
      </Card>
    </Column>
  </Column>
);

export default FixedExpensesSkeleton;
