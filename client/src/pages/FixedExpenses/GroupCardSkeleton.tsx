import { Skeleton, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getGroupCardStyle, GROUP_ICON_SIZE } from '@/pages/FixedExpenses/styles';

const GroupCardSkeleton = () => (
  <Row alignItems="center" spacing={1.5} sx={getGroupCardStyle()}>
    <Skeleton variant="circular" width={GROUP_ICON_SIZE} height={GROUP_ICON_SIZE} />
    <Column spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
      <Typography>
        <Skeleton width="40%" />
      </Typography>
      <Typography variant="body2">
        <Skeleton width="55%" />
      </Typography>
      <Typography variant="h6">
        <Skeleton width="35%" />
      </Typography>
    </Column>
  </Row>
);

export default GroupCardSkeleton;
