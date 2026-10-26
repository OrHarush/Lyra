import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CalendarEventRow from '@/pages/Overview/MoneyCalendar/CalendarEventRow';
import { CalendarEventDto } from '@/types/TransactionCalendar';

interface CalendarDayDetailsProps {
  date: string;
  events: CalendarEventDto[];
}

const CalendarDayDetails = ({ date, events }: CalendarDayDetailsProps) => {
  const { t } = useTranslation('overview');

  return (
    <Column sx={{ minWidth: 200 }}>
      <Typography variant="caption" color="text.secondary">
        {dayjs(date).format('dddd, D MMMM')}
      </Typography>
      {events.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
          {t('calendar.nothingScheduled')}
        </Typography>
      )}
      {events.map(event => (
        <CalendarEventRow key={event.id} event={event} />
      ))}
    </Column>
  );
};

export default CalendarDayDetails;
