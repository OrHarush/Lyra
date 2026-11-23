import Column from '@/components/shared/layout/containers/Column';
import ChartPanelSkeleton from '@/pages/Investments/ChartPanelSkeleton';
import { getOverviewCardStyle, getOverviewSidePanelStyle } from '@/pages/Investments/styles';
import SummaryPanelSkeleton from '@/pages/Investments/SummaryPanelSkeleton';

const PortfolioOverviewSkeleton = () => (
  <Column sx={getOverviewCardStyle()}>
    <Column spacing={2.5} sx={getOverviewSidePanelStyle()}>
      <SummaryPanelSkeleton />
    </Column>
    <Column sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
      <ChartPanelSkeleton />
    </Column>
  </Column>
);

export default PortfolioOverviewSkeleton;
