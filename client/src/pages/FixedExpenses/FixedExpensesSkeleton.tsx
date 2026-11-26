import { Box, Card, Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import {
  getBillCardStyle,
  getBillGridStyle,
  getRowCardStyle,
  getSummaryCardStyle,
} from '@/pages/FixedExpenses/styles';

const BILL_CARDS = 3;
const SUBSCRIPTION_ROWS = 3;

const FixedExpensesSkeleton = () => (
  <Column spacing={3}>
    <Card sx={getSummaryCardStyle()}>
      <Column spacing={2}>
        <Row justifyContent="space-between">
          <Skeleton width={110} />
          <Skeleton width={80} />
        </Row>
        <Skeleton width={180} height={56} />
        <Skeleton variant="rounded" height={8} />
        <Row justifyContent="space-between">
          <Skeleton width={100} />
          <Skeleton width={100} />
        </Row>
      </Column>
    </Card>
    <Column spacing={1.5}>
      <Skeleton width={140} height={32} />
      <Box sx={getBillGridStyle()}>
        {Array.from({ length: BILL_CARDS }, (_, index) => (
          <Column key={index} spacing={1} alignItems="center" sx={getBillCardStyle()}>
            <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: '18px' }} />
            <Skeleton width="60%" />
            <Skeleton width="50%" height={28} />
            <Skeleton width="55%" />
          </Column>
        ))}
      </Box>
    </Column>
    <Column spacing={1.5}>
      <Skeleton width={100} height={32} />
      {Array.from({ length: SUBSCRIPTION_ROWS }, (_, index) => (
        <Row key={index} alignItems="center" spacing={1.5} sx={getRowCardStyle()}>
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: '16px' }} />
          <Column spacing={0.5} sx={{ flex: 1 }}>
            <Skeleton width="45%" />
            <Skeleton width="35%" />
            <Skeleton width="20%" />
          </Column>
          <Skeleton variant="rounded" width={88} height={40} />
        </Row>
      ))}
    </Column>
  </Column>
);

export default FixedExpensesSkeleton;
