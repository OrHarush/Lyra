import { Typography } from '@mui/material';
import { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { CALENDAR_HEADER_HEIGHT } from '@/pages/Overview/MoneyCalendar/styles';

interface MoneyCalendarHeaderProps {
  month: Dayjs;
  remainingTotal: number | null;
}

const MoneyCalendarHeader = ({ month, remainingTotal }: MoneyCalendarHeaderProps) => {
  const { t } = useTranslation('overview');

  return (
    <Row
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
      flexWrap="wrap"
      minHeight={CALENDAR_HEADER_HEIGHT}
    >
      <Typography variant="subtitle1" fontWeight={600} lineHeight={`${CALENDAR_HEADER_HEIGHT}px`}>
        {month.format('MMMM')}
      </Typography>
      {remainingTotal !== null && (
        <Typography variant="caption" color="text.secondary">
          {t('calendar.stillToCome')}{' '}
          <CurrencyText
            value={remainingTotal}
            variant="caption"
            fontWeight={600}
            hasSign
            hasColor
          />
        </Typography>
      )}
    </Row>
  );
};

export default MoneyCalendarHeader;
