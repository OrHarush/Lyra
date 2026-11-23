import Column from '@/components/shared/layout/containers/Column';
import PortfolioOverviewSkeleton from '@/pages/Investments/PortfolioOverviewSkeleton';
import PurchasesSkeleton from '@/pages/Investments/PurchasesSkeleton';

const InvestmentsSkeleton = () => (
  <Column spacing={2.5}>
    <PortfolioOverviewSkeleton />
    <PurchasesSkeleton />
  </Column>
);

export default InvestmentsSkeleton;
