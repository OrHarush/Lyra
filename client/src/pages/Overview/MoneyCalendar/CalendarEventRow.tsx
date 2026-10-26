import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { CalendarEventDto } from '@/types/TransactionCalendar';
import { isOpenCardBill, toSignedAmount } from '@/utils/entities/calendar';

interface CalendarEventRowProps {
  event: CalendarEventDto;
  date: string;
  showDate?: boolean;
}

const CalendarEventRow = ({ event, date, showDate = false }: CalendarEventRowProps) => {
  const { t } = useTranslation('overview');

  const title =
    event.kind === 'cardBill'
      ? t('calendar.cardBill', {
          name: event.name,
          lastFour: event.lastFourDigits ? ` •${event.lastFourDigits}` : '',
        })
      : event.name || t(`calendar.unnamed.${event.kind}`);

  const details = [
    showDate && dayjs(date).format('D MMM'),
    event.kind === 'cardBill' &&
      t(isOpenCardBill(event, date, dayjs()) ? 'calendar.purchasesSoFar' : 'calendar.purchases', {
        count: event.transactionCount,
      }),
    event.kind !== 'cardBill' && event.isVirtual && t('calendar.scheduled'),
  ].filter(Boolean);

  return (
    <Row justifyContent="space-between" alignItems="center" spacing={2} sx={{ py: 0.5 }}>
      <Column sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {title}
        </Typography>
        {details.length > 0 && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {details.join(' · ')}
          </Typography>
        )}
      </Column>
      <CurrencyText
        value={toSignedAmount(event)}
        variant="body2"
        fontWeight={500}
        hasSign
        hasColor
        sx={{ flexShrink: 0 }}
      />
    </Row>
  );
};

export default CalendarEventRow;
