import { Skeleton, Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { CHARGE_ICON_SIZE, getChargeRowStyle } from '@/pages/FixedExpenses/styles';

const ChargeRowSkeleton = () => (
  <Row sx={getChargeRowStyle()}>
    <Skeleton variant="circular" width={CHARGE_ICON_SIZE} height={CHARGE_ICON_SIZE} />
    <Column spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
      <Typography>
        <Skeleton width={110} />
      </Typography>
      <Typography variant="body2">
        <Skeleton width={70} />
      </Typography>
    </Column>
    <Skeleton width={56} />
  </Row>
);

export default ChargeRowSkeleton;
