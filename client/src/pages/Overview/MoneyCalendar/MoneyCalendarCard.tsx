import { Card, Grid } from '@mui/material';
import { ReactNode } from 'react';

interface MoneyCalendarCardProps {
  children: ReactNode;
}

const MoneyCalendarCard = ({ children }: MoneyCalendarCardProps) => (
  <Grid size={{ xs: 12, md: 6, xl: 7 }}>
    <Card sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', width: '100%' }}>{children}</Card>
  </Grid>
);

export default MoneyCalendarCard;
