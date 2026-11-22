import { Skeleton } from '@mui/material';

interface PortfolioChartSkeletonProps {
  height: number;
}

const PortfolioChartSkeleton = ({ height }: PortfolioChartSkeletonProps) => (
  <Skeleton variant="rounded" height={height} />
);

export default PortfolioChartSkeleton;
