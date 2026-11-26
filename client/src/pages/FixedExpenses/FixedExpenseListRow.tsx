import CallMadeIcon from '@mui/icons-material/CallMade';
import { Button, ButtonBase, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import { getCancelButtonStyle, getRowCardStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface FixedExpenseListRowProps {
  item: FixedExpenseDto;
  onEdit: (item: FixedExpenseDto) => void;
  onCancel?: (item: FixedExpenseDto) => void;
}

const FixedExpenseListRow = ({ item, onEdit, onCancel }: FixedExpenseListRowProps) => {
  const { t } = useTranslation('fixedExpenses');
  const { t: tTransactions } = useTranslation('transactions');

  const date = dayjs(item.nextDate).format('DD/MM');
  const dateLabel = t(item.kind === 'subscription' ? 'row.renewsOn' : 'row.nextOn', { date });
  const frequencyLabel =
    item.frequency === 'Monthly'
      ? ''
      : ` · ${tTransactions(`recurrence.${item.frequency === 'Bimonthly' ? 'bimonthly' : 'yearly'}`)}`;

  return (
    <Row alignItems="center" spacing={1.5} sx={getRowCardStyle()}>
      <ButtonBase
        onClick={() => onEdit(item)}
        aria-label={t('row.edit', { name: item.name })}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', borderRadius: 3, textAlign: 'start' }}
      >
        <Row alignItems="center" spacing={1.5} sx={{ minWidth: 0, width: '100%' }}>
          <FixedExpenseThumbnail item={item} size={56} />
          <Column spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {`${dateLabel}${frequencyLabel}`}
            </Typography>
            <CurrencyText value={item.amount} fontWeight={800} color="error.main" />
          </Column>
        </Row>
      </ButtonBase>
      {onCancel && (
        <Button
          variant="outlined"
          endIcon={<CallMadeIcon sx={{ fontSize: 16 }} />}
          onClick={() => onCancel(item)}
          sx={getCancelButtonStyle()}
        >
          {t('row.cancel')}
        </Button>
      )}
    </Row>
  );
};

export default FixedExpenseListRow;
