import { Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { formatPercent, ILS_DISPLAY, roundForDisplay } from '@/utils/investmentFormat';

interface ProfitTextProps {
  pl: number | null;
  plPct: number | null;
}

const ProfitText = ({ pl, plPct }: ProfitTextProps) => {
  if (pl === null || plPct === null) {
    return <Typography color="text.secondary">—</Typography>;
  }

  return (
    <Row spacing={0.5} alignItems="baseline" dir="ltr" sx={{ display: 'inline-flex' }}>
      <CurrencyText
        value={roundForDisplay(pl)}
        {...ILS_DISPLAY}
        hasSign
        hasColor
        sx={{ fontSize: 'inherit', fontWeight: 600 }}
      />
      <Typography
        component="span"
        dir="ltr"
        color={pl < 0 ? 'error.main' : 'success.main'}
        sx={{ fontSize: 'inherit', fontWeight: 600 }}
      >
        {`· ${formatPercent(plPct, true)}`}
      </Typography>
    </Row>
  );
};

export default ProfitText;
