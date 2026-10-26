import { Box, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import CalendarDayCell from '@/pages/Overview/MoneyCalendar/CalendarDayCell';
import {
  getCalendarGridStyle,
  WEEKDAY_ROW_HEIGHT,
} from '@/pages/Overview/MoneyCalendar/styles';
import { CalendarDayDto } from '@/types/TransactionCalendar';
import { countCalendarWeeks, findDay } from '@/utils/entities/calendar';

interface MoneyCalendarGridProps {
  month: Dayjs;
  days: CalendarDayDto[];
  today?: Dayjs;
  selectedDate?: string;
  hasTooltips?: boolean;
  selectDay?: (date: string) => void;
}

const SUNDAY = dayjs('2023-01-01');

const buildWeekdayLabels = (language: string) => {
  const formatter = new Intl.DateTimeFormat(language, { weekday: 'narrow' });

  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(SUNDAY.add(index, 'day').toDate())
  );
};

const MoneyCalendarGrid = ({
  month,
  days,
  today = dayjs(),
  selectedDate,
  hasTooltips = false,
  selectDay,
}: MoneyCalendarGridProps) => {
  const { i18n } = useTranslation();
  const firstDay = month.startOf('month');
  const monthDays = Array.from({ length: month.daysInMonth() }, (_, index) =>
    firstDay.add(index, 'day')
  );

  return (
    <Box sx={getCalendarGridStyle(countCalendarWeeks(month))}>
      {buildWeekdayLabels(i18n.language).map((label, index) => (
        <Typography key={index} variant="caption" color="text.secondary" lineHeight={`${WEEKDAY_ROW_HEIGHT}px`}>
          {label}
        </Typography>
      ))}
      {firstDay.day() > 0 && <Box sx={{ gridColumn: `span ${firstDay.day()}` }} />}
      {monthDays.map(day => {
        const date = day.format('YYYY-MM-DD');

        return (
          <CalendarDayCell
            key={date}
            day={day}
            details={findDay(days, date)}
            isToday={day.isSame(today, 'day')}
            isPast={day.isBefore(today, 'day')}
            isSelected={date === selectedDate}
            hasTooltip={hasTooltips}
            selectDay={selectDay}
          />
        );
      })}
    </Box>
  );
};

export default MoneyCalendarGrid;
