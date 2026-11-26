import { ButtonBase, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import { getBillCardStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface BillCardProps {
  item: FixedExpenseDto;
  onEdit: (item: FixedExpenseDto) => void;
}

const BillCard = ({ item, onEdit }: BillCardProps) => {
  const { t } = useTranslation('fixedExpenses');

  return (
    <ButtonBase
      onClick={() => onEdit(item)}
      aria-label={t('row.edit', { name: item.name })}
      sx={getBillCardStyle()}
    >
      <Column spacing={1} alignItems="center" width="100%">
        <FixedExpenseThumbnail item={item} size={64} />
        <Typography fontWeight={700} noWrap maxWidth="100%">
          {item.name}
        </Typography>
        <CurrencyText value={item.amount} variant="h6" fontWeight={800} />
        <Typography variant="caption" color="text.secondary" noWrap maxWidth="100%">
          {t('row.dueBy', { date: dayjs(item.nextDate).format('DD/MM') })}
        </Typography>
      </Column>
    </ButtonBase>
  );
};

export default BillCard;
