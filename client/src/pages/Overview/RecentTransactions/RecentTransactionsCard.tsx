import { Card, Grid } from '@mui/material';
import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

interface RecentTransactionsCardProps {
  children: ReactNode;
}

const RecentTransactionsCard = ({ children }: RecentTransactionsCardProps) => (
  <Grid size={{ xs: 12, md: 12, lg: 4 }} sx={{ display: 'flex', minHeight: 0 }}>
    <Card sx={{ width: '100%', p: { xs: 2, sm: 2.5 }, display: 'flex', minHeight: 0 }}>
      <Column spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Column>
    </Card>
  </Grid>
);

export default RecentTransactionsCard;
