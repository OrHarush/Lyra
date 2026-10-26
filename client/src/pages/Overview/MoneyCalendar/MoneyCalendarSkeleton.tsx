import { Box, Skeleton } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import MoneyCalendarCard from '@/pages/Overview/MoneyCalendar/MoneyCalendarCard';
import {
  CALENDAR_HEADER_HEIGHT,
  getCalendarGridStyle,
} from '@/pages/Overview/MoneyCalendar/styles';
import { countCalendarWeeks } from '@/utils/entities/calendar';

interface MoneyCalendarSkeletonProps {
  month?: Dayjs;
}

const SIDE_ROW_COUNT = 3;

const MoneyCalendarSkeleton = ({ month = dayjs() }: MoneyCalendarSkeletonProps) => {
  const weekCount = countCalendarWeeks(month);

  return (
    <MoneyCalendarCard>
      <Column spacing={1} height="100%">
        <Row alignItems="center" minHeight={CALENDAR_HEADER_HEIGHT}>
          <Skeleton variant="rounded" width={90} height={20} />
        </Row>
        <Row spacing={3} sx={{ flex: 1 }}>
          <Box
            sx={{
              ...getCalendarGridStyle(weekCount),
              flex: { md: '1 1 50%' },
              width: { xs: '100%', md: 'auto' },
              minWidth: { md: 240 },
              maxWidth: { md: 380 },
            }}
          >
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={`weekday-${index}`} variant="text" width={12} sx={{ mx: 'auto' }} />
            ))}
            {Array.from({ length: weekCount * 7 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height="100%" />
            ))}
          </Box>
          <Column spacing={1} sx={{ flex: 1, display: { xs: 'none', md: 'flex' } }}>
            <Skeleton variant="text" width={70} />
            {Array.from({ length: SIDE_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={28} />
            ))}
          </Column>
        </Row>
      </Column>
    </MoneyCalendarCard>
  );
};

export default MoneyCalendarSkeleton;
