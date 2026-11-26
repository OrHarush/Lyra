import { Card, Skeleton, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import DonutSkeleton from '@/pages/FixedExpenses/DonutSkeleton';
import { DONUT_SIZE, getCardStyle } from '@/pages/FixedExpenses/styles';

const CompactSummarySkeleton = () => (
  <Card sx={getCardStyle()}>
    <Row alignItems="center" spacing={2.5}>
      <DonutSkeleton size={DONUT_SIZE.compact} />
      <Column spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2">
          <Skeleton width={50} />
        </Typography>
        <Typography variant="h5">
          <Skeleton width={120} />
        </Typography>
        <Typography variant="body2">
          <Skeleton width="80%" />
        </Typography>
        <Typography variant="body2">
          <Skeleton width="60%" />
        </Typography>
      </Column>
    </Row>
  </Card>
);

export default CompactSummarySkeleton;
