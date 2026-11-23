import { Divider, Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';

const ALLOCATION_DONUT_SIZE = 96;

const SummaryPanelSkeleton = () => (
  <>
    <Column spacing={2.5}>
      <Column spacing={1.25} alignItems="flex-start">
        <Row justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
          <Column spacing={0.25}>
            <Skeleton variant="rounded" width={96} height={21} />
            <Skeleton variant="rounded" width={150} height={18} />
          </Column>
          <Skeleton variant="rounded" width={72} height={24} sx={{ borderRadius: 3 }} />
        </Row>
        <Skeleton
          variant="rounded"
          sx={{ width: { xs: 127, md: 152 }, height: { xs: 44, md: 52.8 } }}
        />
        <Skeleton variant="rounded" width={148} height={27.5} />
      </Column>
      <Skeleton variant="rounded" width="100%" height={8} />
      <Row justifyContent="space-between">
        <Column spacing={0.5} alignItems="flex-start">
          <Skeleton variant="rounded" width={57} height={19.5} />
          <Skeleton variant="rounded" width={68} height={27} />
        </Column>
        <Column spacing={0.5} alignItems="flex-start">
          <Skeleton variant="rounded" width={57} height={19.5} />
          <Skeleton variant="rounded" width={68} height={27} />
        </Column>
      </Row>
    </Column>
    <Divider />
    <Column spacing={2}>
      <Skeleton variant="rounded" width={88} height={21} />
      <Row spacing={2} alignItems="center" justifyContent="space-between">
        <Column spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="rounded" width={96} height={21} />
          <Skeleton variant="rounded" width={120} height={19.5} />
        </Column>
        <Skeleton
          variant="circular"
          width={ALLOCATION_DONUT_SIZE}
          height={ALLOCATION_DONUT_SIZE}
          sx={{ flexShrink: 0 }}
        />
      </Row>
    </Column>
  </>
);

export default SummaryPanelSkeleton;
