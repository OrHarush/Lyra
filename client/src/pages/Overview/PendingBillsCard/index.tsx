import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import { usePendingBills } from '@/hooks/entities/useBills';
import PendingBillRow from '@/pages/Overview/PendingBillsCard/PendingBillRow';

// Renders nothing until there is a bill to approve, so people without bills never see it.
const PendingBillsCard = () => {
  const { t } = useTranslation('bills');
  const { pendingBills } = usePendingBills();

  if (pendingBills.length === 0) {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, flexShrink: 0 }}>
      <Column spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={700}>
          {t('card.title')}
        </Typography>
        {pendingBills.map(bill => (
          <PendingBillRow key={bill.transactionId} bill={bill} />
        ))}
      </Column>
    </Paper>
  );
};

export default PendingBillsCard;
