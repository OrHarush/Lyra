import { Card, Divider } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { buildDemoCalendarDays, DEMO_SELECTED_DAY } from '@/pages/Home/DashboardClaritySection/constants';
import CalendarDayDetails from '@/pages/Overview/MoneyCalendar/CalendarDayDetails';
import MoneyCalendarGrid from '@/pages/Overview/MoneyCalendar/MoneyCalendarGrid';
import MoneyCalendarHeader from '@/pages/Overview/MoneyCalendar/MoneyCalendarHeader';
import { findDay } from '@/utils/entities/calendar';

const PhoneCalendarBlock = () => {
  const { t } = useTranslation('overview');
  const month = dayjs().startOf('month');
  const days = buildDemoCalendarDays(month, t);
  const demoToday = month.date(DEMO_SELECTED_DAY);
  const selectedDate = demoToday.format('YYYY-MM-DD');

  return (
    <Card sx={{ p: 2 }}>
      <Column spacing={1}>
        <MoneyCalendarHeader month={month} remainingTotal={null} />
        <MoneyCalendarGrid month={month} days={days} today={demoToday} selectedDate={selectedDate} />
        <Divider />
        <CalendarDayDetails day={findDay(days, selectedDate)} />
      </Column>
    </Card>
  );
};

export default PhoneCalendarBlock;
