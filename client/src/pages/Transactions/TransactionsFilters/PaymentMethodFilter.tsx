import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import MultiSelectChip from '@/components/shared/inputs/MultiSelectChip';
import { buildGroupedItems } from '@/components/shared/inputs/MultiSelectChip/buildGroupedItems';
import { usePaymentMethods } from '@/hooks/entities/usePaymentMethods';
import { getPaymentMethodDisplayName, PAYMENT_TYPE_GROUPS } from '@/utils/entities/paymentMethod';

interface PaymentMethodFilterProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const PaymentMethodFilter = ({ selectedIds, onChange }: PaymentMethodFilterProps) => {
  const { t } = useTranslation('transactions');
  const { t: tPm } = useTranslation('paymentMethods');
  const { paymentMethods } = usePaymentMethods();

  const items = buildGroupedItems(
    PAYMENT_TYPE_GROUPS.map(group => ({
      label: tPm(group.labelKey.replace('paymentMethods:', '')),
      items: paymentMethods
        .filter(pm => group.types.includes(pm.type))
        .map(pm => ({
          id: pm._id,
          renderRow: () => (
            <Typography variant="body2">{getPaymentMethodDisplayName(pm, tPm)}</Typography>
          ),
        })),
    }))
  );

  return (
    <MultiSelectChip
      label={
        selectedIds.length === 0
          ? t('filters.allPaymentMethods')
          : t('filters.selectedPaymentMethods', { count: selectedIds.length })
      }
      icon={<CreditCardIcon />}
      selectedIds={selectedIds}
      onChange={onChange}
      items={items}
    />
  );
};

export default PaymentMethodFilter;
