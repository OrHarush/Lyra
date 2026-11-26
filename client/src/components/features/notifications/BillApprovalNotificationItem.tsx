import { useTranslation } from 'react-i18next';

import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import NotificationRow from '@/components/features/notifications/NotificationRow';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { useBillTitle } from '@/hooks/business/useBillTitle';
import { useBillApproval } from '@/providers/BillApprovalProvider';
import { NotificationItemProps } from '@/types/Notification';
import { BILL_TYPE_ICONS } from '@/utils/entities/fixedExpenseIcons';

const BillApprovalNotificationItem = ({
  notification,
  closePanel,
}: NotificationItemProps<'billApproval'>) => {
  const { t } = useTranslation('bills');
  const openBillApproval = useBillApproval();
  const bill = notification.data;
  const billTitle = useBillTitle(bill);

  const approveBill = () => {
    closePanel();
    openBillApproval(bill);
  };

  return (
    <NotificationRow
      icon={<FixedExpenseIcon name={BILL_TYPE_ICONS[bill.billType ?? 'other']} size={40} />}
      title={t('waitingForApproval', { bill: billTitle })}
      detail={
        <>
          {t('estimated')} <CurrencyText value={bill.amount} variant="body2" />
        </>
      }
      createdAt={notification.createdAt}
      onOpen={approveBill}
    />
  );
};

export default BillApprovalNotificationItem;
