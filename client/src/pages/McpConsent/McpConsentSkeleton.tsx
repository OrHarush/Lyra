import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const McpConsentSkeleton = () => (
  <Column spacing={2.5}>
    <Column spacing={1.5} alignItems="center">
      <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 4 }} />
      <Skeleton variant="rounded" height={28} width="85%" />
      <Skeleton variant="rounded" height={28} width="60%" />
    </Column>
    <Skeleton variant="rounded" height={140} />
    <Skeleton variant="rounded" height={24} width="55%" />
    <Skeleton variant="rounded" height={112} />
    <Row spacing={1.5}>
      <Skeleton variant="rounded" height={44} sx={{ flex: 1 }} />
      <Skeleton variant="rounded" height={44} sx={{ flex: 2 }} />
    </Row>
  </Column>
);

export default McpConsentSkeleton;
