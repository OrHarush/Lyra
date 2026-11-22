import { Typography } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import type { PurchaseCurrency } from '@/types/Investment';
import { displayOf, ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface PurchaseMoneyProps {
  ils: number | null;
  original: number | null;
  currency: PurchaseCurrency;
  isBold?: boolean;
  alignment?: 'flex-start' | 'flex-end';
}

const PurchaseMoney = ({
  ils,
  original,
  currency,
  isBold = false,
  alignment = 'flex-start',
}: PurchaseMoneyProps) => {
  if (ils === null) {
    return <Typography color="text.secondary">—</Typography>;
  }

  return (
    <Column alignItems={alignment}>
      <CurrencyText
        value={roundForDisplay(ils)}
        {...ILS_DISPLAY}
        sx={{ fontSize: 'inherit', fontWeight: isBold ? 700 : 400 }}
      />
      {currency === 'USD' && original !== null && (
        <CurrencyText
          value={roundForDisplay(original)}
          {...displayOf(currency)}
          color="text.secondary"
          sx={{ fontSize: '0.6875rem' }}
        />
      )}
    </Column>
  );
};

export default PurchaseMoney;
