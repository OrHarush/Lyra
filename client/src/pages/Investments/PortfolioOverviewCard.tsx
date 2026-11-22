import { Divider } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import AllocationDonut from '@/pages/Investments/AllocationDonut';
import PortfolioSummaryCard from '@/pages/Investments/PortfolioSummaryCard';
import { getOverviewCardStyle, getOverviewSidePanelStyle } from '@/pages/Investments/styles';
import type { FundColor } from '@/theme/investmentColors';
import type { InvestmentSummaryDto } from '@/types/Investment';

interface PortfolioOverviewCardProps {
  summary: InvestmentSummaryDto;
  colors: Map<string, FundColor>;
  chart: ReactNode;
}

const PortfolioOverviewCard = ({ summary, colors, chart }: PortfolioOverviewCardProps) => (
  <Column sx={getOverviewCardStyle()}>
    <Column spacing={2.5} sx={getOverviewSidePanelStyle()}>
      <PortfolioSummaryCard
        totals={summary.totals}
        pricesAsOf={summary.pricesAsOf}
        isStale={summary.stale}
      />
      <Divider />
      <AllocationDonut funds={summary.funds} colors={colors} />
    </Column>
    <Column sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>{chart}</Column>
  </Column>
);

export default PortfolioOverviewCard;
