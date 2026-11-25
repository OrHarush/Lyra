import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';

const ConnectedAppsSkeleton = () => (
  <Column spacing={1.5}>
    <Skeleton variant="rounded" height={76} />
    <Skeleton variant="rounded" height={76} />
  </Column>
);

export default ConnectedAppsSkeleton;
