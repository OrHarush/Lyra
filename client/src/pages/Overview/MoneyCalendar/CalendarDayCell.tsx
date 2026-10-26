import { Stack, Tooltip } from '@mui/material';
import { Dayjs } from 'dayjs';

import CalendarDayDetails from '@/pages/Overview/MoneyCalendar/CalendarDayDetails';
import CalendarEventDots from '@/pages/Overview/MoneyCalendar/CalendarEventDots';
import { getDayCellStyle } from '@/pages/Overview/MoneyCalendar/styles';
import { CalendarDayDto } from '@/types/TransactionCalendar';

interface CalendarDayCellProps {
  day: Dayjs;
  details: CalendarDayDto;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  hasTooltip: boolean;
  selectDay?: (date: string) => void;
}

const CalendarDayCell = ({
  day,
  details,
  isToday,
  isPast,
  isSelected,
  hasTooltip,
  selectDay,
}: CalendarDayCellProps) => {
  const date = day.format('YYYY-MM-DD');
  const hasDetails = details.events.length > 0 || details.balance !== null;

  // Stack instead of Column: Tooltip needs a child that forwards its ref.
  const cell = (
    <Stack
      role={selectDay ? 'button' : undefined}
      onClick={selectDay ? () => selectDay(date) : undefined}
      sx={getDayCellStyle({
        isToday,
        isPast,
        isSelected,
        isClickable: !!selectDay || (hasTooltip && hasDetails),
      })}
    >
      {day.date()}
      <CalendarEventDots events={details.events} />
    </Stack>
  );

  if (!hasTooltip || !hasDetails) {
    return cell;
  }

  return (
    <Tooltip arrow placement="top" title={<CalendarDayDetails day={details} />}>
      {cell}
    </Tooltip>
  );
};

export default CalendarDayCell;
