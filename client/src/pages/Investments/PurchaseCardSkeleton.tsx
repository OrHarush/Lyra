import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { getPurchaseCardStyle } from '@/pages/Investments/styles';

const PurchaseCardSkeleton = () => (
  <Column sx={getPurchaseCardStyle(false)}>
    <Column spacing={2} sx={{ width: '100%' }}>
      <Row justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Skeleton variant="rounded" width={53} height={21.2} />
        <Skeleton variant="rounded" width={70} height={19.5} />
      </Row>
      <Row justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Column spacing={0.25} alignItems="flex-start">
          <Skeleton variant="rounded" width={72} height={19.5} />
          <Skeleton variant="rounded" width={95} height={45} />
        </Column>
        <Column spacing={0.75} alignItems="flex-start">
          <Skeleton variant="rounded" width={86} height={25.5} />
          <Skeleton variant="rounded" width={70} height={27.5} />
        </Column>
      </Row>
      <Row spacing={0.75} alignItems="baseline">
        <Skeleton variant="rounded" width={40} height={19.5} />
        <Skeleton variant="rounded" width={51} height={24} />
      </Row>
      <Skeleton variant="rounded" width="100%" height={40} />
    </Column>
  </Column>
);

export default PurchaseCardSkeleton;
