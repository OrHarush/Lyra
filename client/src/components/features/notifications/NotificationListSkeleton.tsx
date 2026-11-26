import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const ROW_COUNT = 2;

const NotificationListSkeleton = () => (
  <Column spacing={1}>
    {Array.from({ length: ROW_COUNT }, (_, index) => (
      <Row key={index} spacing={1.5} alignItems="center" sx={{ p: 1 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
        <Column sx={{ flex: 1 }}>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </Column>
      </Row>
    ))}
  </Column>
);

export default NotificationListSkeleton;
