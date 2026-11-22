import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { TransactionTotalsDto } from '@/types/Transaction';

interface MobileTransactionsTotalsProps {
  totals?: TransactionTotalsDto;
}

const MobileTransactionsTotals = ({ totals }: MobileTransactionsTotalsProps) => (
  <Row spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
    <Row spacing={1} alignItems="center">
      <ArrowDownwardIcon fontSize="small" color="error" />
      <CurrencyText value={totals?.expenses ?? 0} color="error" />
    </Row>
    <Row spacing={1} alignItems="center">
      <ArrowUpwardIcon fontSize="small" color="success" />
      <CurrencyText value={totals?.income ?? 0} color="success" />
    </Row>
  </Row>
);

export default MobileTransactionsTotals;
