import { Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { CHART_HEIGHT } from '@/pages/Investments/chartModel';
import PortfolioChartSkeleton from '@/pages/Investments/PortfolioChartSkeleton';

const RANGE_SIZE = { width: 150, height: 31 };
const FILTER_SIZE = { width: 141.3, height: 36 };
const ADD_BUTTON_SIZE = { width: 131.8, height: 40 };

const ChartPanelSkeleton = () => {
  const isSmallScreen = useIsSmallScreen();

  return (
    <Column spacing={2}>
      <Row justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Column spacing={0.25}>
          <Skeleton variant="rounded" width={176.6} height={27} />
          <Skeleton variant="rounded" width={120} height={19.5} />
        </Column>
        <Row spacing={1.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Skeleton variant="rounded" {...RANGE_SIZE} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" {...FILTER_SIZE} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" {...ADD_BUTTON_SIZE} />
        </Row>
      </Row>
      <Row
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
        sx={{ display: { xs: 'flex', md: 'none' } }}
      >
        <Skeleton variant="rounded" {...RANGE_SIZE} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" {...FILTER_SIZE} sx={{ borderRadius: 3 }} />
      </Row>
      <PortfolioChartSkeleton height={isSmallScreen ? CHART_HEIGHT.mobile : CHART_HEIGHT.desktop} />
    </Column>
  );
};

export default ChartPanelSkeleton;
