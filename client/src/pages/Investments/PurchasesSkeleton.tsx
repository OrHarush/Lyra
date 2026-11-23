import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import PurchaseCardSkeleton from '@/pages/Investments/PurchaseCardSkeleton';
import { getPurchaseStripStyle } from '@/pages/Investments/styles';

const SKELETON_CARD_COUNT = 3;

const PurchasesSkeleton = () => (
  <Column spacing={1.5}>
    <Column spacing={0.25}>
      <Skeleton variant="rounded" width={120} height={27} />
      <Skeleton variant="rounded" width={190} height={19.5} />
    </Column>
    <Row spacing={1.5} sx={getPurchaseStripStyle()}>
      {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
        <PurchaseCardSkeleton key={index} />
      ))}
    </Row>
  </Column>
);

export default PurchasesSkeleton;
