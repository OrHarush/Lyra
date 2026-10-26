import { Box, Skeleton } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import MoneyCalendarCard from '@/pages/Overview/MoneyCalendar/MoneyCalendarCard';

const MoneyCalendarSkeleton = () => (
  <MoneyCalendarCard>
    <Column spacing={1.5}>
      <Skeleton variant="text" width={100} height={28} />
      <Row spacing={3}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 0.5,
            flex: { md: '1 1 60%' },
            width: { xs: '100%', md: 'auto' },
            minWidth: { md: 260 },
            maxWidth: { md: 460 },
          }}
        >
          {Array.from({ length: 35 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={30} />
          ))}
        </Box>
        <Column spacing={1} sx={{ flex: 1, display: { xs: 'none', md: 'flex' } }}>
          {[1, 2, 3, 4].map(index => (
            <Skeleton key={index} variant="text" height={36} />
          ))}
        </Column>
      </Row>
    </Column>
  </MoneyCalendarCard>
);

export default MoneyCalendarSkeleton;
