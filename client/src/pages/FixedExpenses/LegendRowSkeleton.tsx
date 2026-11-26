import { Skeleton, Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';

const LegendRowSkeleton = () => (
  <Row justifyContent="space-between" alignItems="center" spacing={2} sx={{ py: 1 }}>
    <Row alignItems="center" spacing={1}>
      <Skeleton variant="circular" width={9} height={9} />
      <Typography variant="body2">
        <Skeleton width={90} />
      </Typography>
    </Row>
    <Typography variant="body2">
      <Skeleton width={28} />
    </Typography>
  </Row>
);

export default LegendRowSkeleton;
