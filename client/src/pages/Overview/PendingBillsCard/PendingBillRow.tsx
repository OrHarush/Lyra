import { Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { useBillTitle } from '@/hooks/business/useBillTitle';
import { useBillApproval } from '@/providers/BillApprovalProvider';
import { PendingBillDto } from '@/types/Bill';
import { BILL_TYPE_ICONS } from '@/utils/entities/fixedExpenseIcons';

interface PendingBillRowProps {
  bill: PendingBillDto;
}

const PendingBillRow = ({ bill }: PendingBillRowProps) => {
  const { t } = useTranslation('bills');
  const openBillApproval = useBillApproval();
  const title = useBillTitle(bill);

  const approve = () => openBillApproval(bill);

  return (
    <Row spacing={1.5} alignItems="center">
      <FixedExpenseIcon name={BILL_TYPE_ICONS[bill.billType ?? 'other']} size={40} />
      <Column sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dayjs(bill.date.split('T')[0]).format('DD/MM')} · {t('estimated')}{' '}
          <CurrencyText value={bill.amount} variant="caption" />
        </Typography>
      </Column>
      <Button variant="contained" size="small" onClick={approve} sx={{ flexShrink: 0 }}>
        {t('card.approve')}
      </Button>
    </Row>
  );
};

export default PendingBillRow;
