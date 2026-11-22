import { Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import RecentTransactionsCard from '@/pages/Overview/RecentTransactions/RecentTransactionsCard';

interface RecentTransactionsSkeletonProps {
  rows: number;
}

const RecentTransactionsSkeleton = ({ rows }: RecentTransactionsSkeletonProps) => {
  const { t } = useTranslation('overview');

  return (
    <RecentTransactionsCard>
      <Typography variant="h5" color="text.primary">
        {t('recentTransactions.title')}
      </Typography>
      {Array.from({ length: rows }, (_, index) => (
        <Row key={index} spacing={1.5} alignItems="center" sx={{ px: 1, py: 0.75 }}>
          <Skeleton variant="rounded" width={36} height={36} sx={{ flexShrink: 0 }} />
          <Column sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Column>
          <Skeleton variant="text" width={56} />
        </Row>
      ))}
    </RecentTransactionsCard>
  );
};

export default RecentTransactionsSkeleton;
