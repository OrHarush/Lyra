import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Button, Chip, IconButton, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import ActionMenu from '@/components/shared/ui/ActionMenu';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface FixedExpenseRowProps {
  item: FixedExpenseDto;
  onCancel: (item: FixedExpenseDto) => void;
  onEdit: (item: FixedExpenseDto) => void;
}

const FixedExpenseRow = ({ item, onCancel, onEdit }: FixedExpenseRowProps) => {
  const { t } = useTranslation('fixedExpenses');
  const { t: tTransactions } = useTranslation('transactions');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const frequencyLabel = tTransactions(
    `recurrence.${item.frequency.toLowerCase() as 'monthly' | 'bimonthly' | 'yearly'}`
  );
  const nextLabel = t('row.next', { date: dayjs(item.nextDate).format('DD/MM/YY') });

  return (
    <Row alignItems="center" spacing={1.5} sx={{ py: 1.5 }}>
      <CategoryIconFrame color={item.category?.color} icon={item.category?.icon} />
      <Column spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Row alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography fontWeight={600} noWrap>
            {item.name}
          </Typography>
          {item.kind === 'bill' && (
            <Chip size="small" variant="outlined" label={t('row.estimate')} sx={{ height: 20 }} />
          )}
        </Row>
        <Typography variant="body2" color="text.secondary" noWrap>
          {`${frequencyLabel} · ${nextLabel}`}
        </Typography>
      </Column>
      <Column alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
        <CurrencyText value={item.amount} fontWeight={600} />
        {item.frequency !== 'Monthly' && (
          <Row spacing={0.5} alignItems="baseline">
            <CurrencyText value={item.monthlyAmount} variant="caption" color="text.secondary" />
            <Typography variant="caption" color="text.secondary">
              {t('row.perMonth')}
            </Typography>
          </Row>
        )}
      </Column>
      {item.kind === 'subscription' && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => onCancel(item)}
          sx={{ flexShrink: 0 }}
        >
          {t('row.cancel')}
        </Button>
      )}
      <IconButton
        size="small"
        aria-label={t('row.moreActions')}
        onClick={event => setMenuAnchor(event.currentTarget)}
        sx={{ flexShrink: 0 }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <ActionMenu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        items={[{ label: t('row.edit'), onClick: () => onEdit(item) }]}
      />
    </Row>
  );
};

export default FixedExpenseRow;
