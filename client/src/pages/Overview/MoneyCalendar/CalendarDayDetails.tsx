import { Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import CalendarEventRow from '@/pages/Overview/MoneyCalendar/CalendarEventRow';
import { CalendarDayDto } from '@/types/TransactionCalendar';

interface CalendarDayDetailsProps {
  day: CalendarDayDto;
}

const CalendarDayDetails = ({ day }: CalendarDayDetailsProps) => {
  const { date, events, balance, isProjected } = day;
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
        <CalendarEventRow key={event.id} event={event} date={date} />
      ))}
      {balance !== null && (
        <>
          <Divider sx={{ my: 0.5 }} />
          <Row justifyContent="space-between" alignItems="center" spacing={2} sx={{ py: 0.25 }}>
            <Typography variant="caption" color="text.secondary">
              {t(isProjected ? 'calendar.projectedBalance' : 'calendar.endOfDayBalance')}
            </Typography>
            <CurrencyText value={balance} variant="body2" fontWeight={600} />
          </Row>
        </>
      )}
    </Column>
  );
};

export default CalendarDayDetails;
