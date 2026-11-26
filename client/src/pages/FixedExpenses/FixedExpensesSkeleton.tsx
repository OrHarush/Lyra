import { Card, Divider, Skeleton } from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getListCardStyle, getSummaryCardStyle } from '@/pages/FixedExpenses/styles';

const ROWS = 5;

const FixedExpensesSkeleton = () => (
  <Column spacing={2.5}>
    <Card sx={getSummaryCardStyle()}>
      <Row justifyContent="space-between" alignItems="flex-end">
        <Column spacing={0.5}>
          <Skeleton width={110} />
          <Skeleton width={180} height={56} />
        </Column>
        <Column spacing={0.5} alignItems="flex-end">
          <Skeleton width={90} />
          <Skeleton width={160} />
        </Column>
      </Row>
    </Card>
    <Card sx={getListCardStyle()}>
      {Array.from({ length: ROWS }, (_, index) => (
        <Fragment key={index}>
          {index > 0 && <Divider />}
          <Row alignItems="center" spacing={2} sx={{ minHeight: 64 }}>
            <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
            <Skeleton width="30%" />
            <Skeleton width="15%" />
            <Skeleton width="12%" sx={{ marginInlineStart: 'auto' }} />
          </Row>
        </Fragment>
      ))}
    </Card>
  </Column>
);

export default FixedExpensesSkeleton;
