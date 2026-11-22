import { Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import { usePageHeader } from '@/components/shared/layout/PageHeaderContext';
import PageLayout from '@/components/shared/layout/page/PageLayout';

import BalanceBreakdownCard from './BalanceBreakdownCard';
import RunCard from './RunCard';
import SnapshotHistoryCard from './SnapshotHistoryCard';
import { useDebugSnapshots } from './useDebugSnapshots';

export const AdminDebugPage = () => {
  usePageHeader('דיבוג');

  const { data: snapshots, isLoading } = useDebugSnapshots();
  const list = snapshots ?? [];

  return (
    <PageLayout>
      <Column spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          דיבוג
        </Typography>
        <Typography variant="body2" color="text.secondary">
          הרצה ושחזור של עבודות סנכרון יתרה לחשבון שלך בלבד
        </Typography>
      </Column>

      <RunCard snapshots={list} />
      <BalanceBreakdownCard />
      <SnapshotHistoryCard snapshots={list} isLoading={isLoading} />
    </PageLayout>
  );
};

export default AdminDebugPage;
