import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const ROW_COUNT = 5;

const TrendTransactionsSkeleton = () => (
  <Column spacing={1.5}>
    {Array.from({ length: ROW_COUNT }, (_, index) => (
      <Row key={index} alignItems="center" spacing={1.5}>
        <Column sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="35%" />
        </Column>
        <Skeleton variant="text" width={64} />
      </Row>
    ))}
  </Column>
);

export default TrendTransactionsSkeleton;
