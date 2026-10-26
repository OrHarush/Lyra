import { Typography, TypographyProps } from '@mui/material';
import CountUp from 'react-countup';

import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency } from '@/utils/currency';

export interface CurrencyTextProps extends TypographyProps {
  value: number;
  currency?: string;
  locale?: string;
  hasColor?: boolean;
  hasSign?: boolean;
  isAnimated?: boolean;
}

const CurrencyText = ({
  value,
  currency,
  locale = 'he-IL',
  hasColor = false,
  hasSign = false,
  isAnimated = false,
  ...typographyProps
}: CurrencyTextProps) => {
  const { user } = useAuth();
  const resolvedCurrency = currency ?? user?.displayCurrency ?? 'ILS';

  const formattedCurrency = formatCurrency(value, resolvedCurrency, locale);

  const color = value >= 0 ? 'success.main' : 'error.main';
  const suffix = formattedCurrency.replace(/[\d,.\s\-\u200f\u200e\u202a-\u202e]/g, '').trim();
  const decimalPlaces = Number.isInteger(value) ? 0 : 2;

  return (
    <Typography
      component="span"
      dir="ltr"
      {...typographyProps}
      color={hasColor ? color : typographyProps.color}
    >
      {hasSign && value > 0 && '+'}
      {isAnimated ? (
        <CountUp end={value} duration={1.5} decimals={decimalPlaces} suffix={suffix} />
      ) : (
        formattedCurrency
      )}
    </Typography>
  );
};

export default CurrencyText;
