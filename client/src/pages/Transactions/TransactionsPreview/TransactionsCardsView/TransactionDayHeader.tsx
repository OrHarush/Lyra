import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

interface TransactionDayHeaderProps {
  date: string;
}

const TransactionDayHeader = ({ date }: TransactionDayHeaderProps) => {
  const { t, i18n } = useTranslation('transactions');
  const day = dayjs(date);
  const today = dayjs();

  const label = (() => {
    if (day.isSame(today, 'day')) {
      return t('day.today');
    }

    if (day.isSame(today.subtract(1, 'day'), 'day')) {
      return t('day.yesterday');
    }

    return day.toDate().toLocaleDateString(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  })();

  return (
    <Typography
      variant="caption"
      color="text.secondary"
      fontWeight={600}
      sx={{ px: 2, pt: 1.5, pb: 0.5 }}
    >
      {label}
    </Typography>
  );
};

export default TransactionDayHeader;
