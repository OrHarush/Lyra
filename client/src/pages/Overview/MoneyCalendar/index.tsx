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
  isInMonth,
  selectEventsFrom,
  selectLargestEvents,
  sumSignedAmounts,
} from '@/utils/entities/calendar';

const SIDE_LIST_LIMIT = 3;

const MoneyCalendar = () => {
  const { t } = useTranslation('overview');
  const { date, account } = useOverviewFilters();
  const { days, upcoming, isLoading } = useTransactionCalendar(date, account?._id);
  const isSmallScreen = useIsSmallScreen();
  const today = dayjs();
  const [selectedDate, setSelectedDate] = useState(today.format('YYYY-MM-DD'));

  if (isLoading) {
    return <MoneyCalendarSkeleton month={date} />;
  }

  const isPastMonth = date.isBefore(today, 'month');
  const isCurrentMonth = date.isSame(today, 'month');
  const monthDays = days.filter(day => isInMonth(day.date, date));
  const hasAnyEvents = monthDays.some(day => day.events.length > 0);
  const remainingEvents = isPastMonth
    ? []
    : selectEventsFrom(monthDays, isCurrentMonth ? today.format('YYYY-MM-DD') : '');
  const remainingTotal = remainingEvents.length > 0 ? sumSignedAmounts(remainingEvents) : null;
  const sideEvents = isPastMonth
    ? selectLargestEvents(monthDays, SIDE_LIST_LIMIT)
    : (isCurrentMonth ? upcoming : remainingEvents).slice(0, SIDE_LIST_LIMIT);
  const emptyText = isCurrentMonth
    ? t('calendar.nothingNext30Days')
    : t(hasAnyEvents ? 'calendar.nothingLeft' : 'calendar.empty');
  const visibleSelectedDate = days.some(day => day.date === selectedDate)
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
              emptyText={emptyText}
              events={sideEvents}
            />
          </Row>
        )}
      </Column>
    </MoneyCalendarCard>
  );
};

export default MoneyCalendar;
