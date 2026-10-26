import { Divider, Typography } from '@mui/material';
import { Fragment } from 'react';

import Column from '@/components/shared/layout/containers/Column';
import CalendarEventRow from '@/pages/Overview/MoneyCalendar/CalendarEventRow';
import { DatedCalendarEvent } from '@/types/TransactionCalendar';

interface MoneyCalendarUpcomingProps {
  title: string;
  emptyText: string;
  events: DatedCalendarEvent[];
}

const MoneyCalendarUpcoming = ({ title, emptyText, events }: MoneyCalendarUpcomingProps) => (
  <Column sx={{ flex: 1, minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    {events.length === 0 && (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    )}
    {events.map(({ date, event }, index) => (
      <Fragment key={`${date}-${event.id}`}>
        {index > 0 && <Divider />}
        <CalendarEventRow event={event} date={date} showDate />
      </Fragment>
    ))}
  </Column>
);

export default MoneyCalendarUpcoming;
