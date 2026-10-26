import { Stack, Tooltip } from '@mui/material';
import { Dayjs } from 'dayjs';

import CalendarDayDetails from '@/pages/Overview/MoneyCalendar/CalendarDayDetails';
import CalendarEventDots from '@/pages/Overview/MoneyCalendar/CalendarEventDots';
import { getDayCellStyle } from '@/pages/Overview/MoneyCalendar/styles';
import { CalendarEventDto } from '@/types/TransactionCalendar';

interface CalendarDayCellProps {
  day: Dayjs;
  events: CalendarEventDto[];
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  hasTooltip: boolean;
  selectDay?: (date: string) => void;
}

const CalendarDayCell = ({
  day,
  events,
  isToday,
  isPast,
  isSelected,
  hasTooltip,
  selectDay,
}: CalendarDayCellProps) => {
  const date = day.format('YYYY-MM-DD');
  const hasEvents = events.length > 0;

  // Stack instead of Column: Tooltip needs a child that forwards its ref.
  const cell = (
    <Stack
      role={selectDay ? 'button' : undefined}
      onClick={selectDay ? () => selectDay(date) : undefined}
      sx={getDayCellStyle({
        isToday,
        isPast,
        isSelected,
        isClickable: !!selectDay || (hasTooltip && hasEvents),
      })}
    >
      {day.date()}
      <CalendarEventDots events={events} />
    </Stack>
  );

  if (!hasTooltip || !hasEvents) {
    return cell;
  }

  return (
    <Tooltip arrow placement="top" title={<CalendarDayDetails date={date} events={events} />}>
      {cell}
    </Tooltip>
  );
};

export default CalendarDayCell;
