import { Box } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import { getEventDotStyle } from '@/pages/Overview/MoneyCalendar/styles';
import { CalendarEventDto } from '@/types/TransactionCalendar';
import { isIncomeEvent } from '@/utils/entities/calendar';

interface CalendarEventDotsProps {
  events: CalendarEventDto[];
}

const CalendarEventDots = ({ events }: CalendarEventDotsProps) => {
  const hasIncome = events.some(isIncomeEvent);
  const hasCharges = events.some(event => !isIncomeEvent(event));

  return (
    <Row spacing={0.25} sx={{ height: 5, mt: 0.25 }}>
      {hasIncome && <Box sx={getEventDotStyle('success')} />}
      {hasCharges && <Box sx={getEventDotStyle('error')} />}
    </Row>
  );
};

export default CalendarEventDots;
