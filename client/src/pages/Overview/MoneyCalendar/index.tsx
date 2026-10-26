import { Divider } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useTransactionCalendar } from '@/hooks/entities/useTransactionCalendar';
import CalendarDayDetails from '@/pages/Overview/MoneyCalendar/CalendarDayDetails';
import MoneyCalendarCard from '@/pages/Overview/MoneyCalendar/MoneyCalendarCard';
import MoneyCalendarGrid from '@/pages/Overview/MoneyCalendar/MoneyCalendarGrid';
import MoneyCalendarHeader from '@/pages/Overview/MoneyCalendar/MoneyCalendarHeader';
import MoneyCalendarSkeleton from '@/pages/Overview/MoneyCalendar/MoneyCalendarSkeleton';
import MoneyCalendarUpcoming from '@/pages/Overview/MoneyCalendar/MoneyCalendarUpcoming';
import { useOverviewFilters } from '@/pages/Overview/OverviewFiltersProvider';
import {
  findDay,
  selectEventsFrom,
  selectLargestEvents,
  sumSignedAmounts,
} from '@/utils/entities/calendar';

const SIDE_LIST_LIMIT = 3;

const MoneyCalendar = () => {
  const { t } = useTranslation('overview');
  const { date, year, month, account } = useOverviewFilters();
  const { days, isLoading } = useTransactionCalendar(year, month, account?._id);
  const isSmallScreen = useIsSmallScreen();
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today.format('YYYY-MM-DD'));

  if (isLoading) {
    return <MoneyCalendarSkeleton month={date} />;
  }

  const isPastMonth = date.isBefore(today, 'month');
  const listFrom = date.isSame(today, 'month')
    ? today.format('YYYY-MM-DD')
    : date.startOf('month').format('YYYY-MM-DD');
  const remainingEvents = isPastMonth ? [] : selectEventsFrom(days, listFrom);
  const sideEvents = isPastMonth
    ? selectLargestEvents(days, SIDE_LIST_LIMIT)
    : remainingEvents.slice(0, SIDE_LIST_LIMIT);
  const hasAnyEvents = days.some(day => day.events.length > 0);
  const remainingTotal = remainingEvents.length > 0 ? sumSignedAmounts(remainingEvents) : null;
  const visibleSelectedDate = date.isSame(selectedDate, 'month')
    ? selectedDate
    : date.startOf('month').format('YYYY-MM-DD');

  return (
    <MoneyCalendarCard>
      <Column spacing={1} height="100%">
        <MoneyCalendarHeader month={date} remainingTotal={remainingTotal} />
        {isSmallScreen ? (
          <Column spacing={1}>
            <MoneyCalendarGrid
              month={date}
              days={days}
              today={today}
              selectedDate={visibleSelectedDate}
              selectDay={setSelectedDate}
            />
            <Divider />
            <CalendarDayDetails day={findDay(days, visibleSelectedDate)} />
          </Column>
        ) : (
          <Row spacing={3} sx={{ flex: 1 }}>
            <Column sx={{ flex: '1 1 50%', minWidth: 240, maxWidth: 380 }}>
              <MoneyCalendarGrid month={date} days={days} today={today} hasTooltips />
            </Column>
            <MoneyCalendarUpcoming
              title={t(isPastMonth ? 'calendar.biggestMovements' : 'calendar.upcoming')}
              emptyText={t(hasAnyEvents ? 'calendar.nothingLeft' : 'calendar.empty')}
              events={sideEvents}
            />
          </Row>
        )}
      </Column>
    </MoneyCalendarCard>
  );
};

export default MoneyCalendar;
