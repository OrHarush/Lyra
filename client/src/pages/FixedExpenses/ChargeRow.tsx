import CallMadeIcon from '@mui/icons-material/CallMade';
import { Button, ButtonBase, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import {
  CHARGE_ICON_SIZE,
  getChargeRowStyle,
  getPillButtonStyle,
} from '@/pages/FixedExpenses/styles';
import { useRelativeChargeLabel } from '@/pages/FixedExpenses/useRelativeChargeLabel';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface ChargeRowProps {
  item: FixedExpenseDto;
  onEdit: (item: FixedExpenseDto) => void;
  onCancel: (item: FixedExpenseDto) => void;
}

const ChargeRow = ({ item, onEdit, onCancel }: ChargeRowProps) => {
  const { t } = useTranslation('fixedExpenses');
  const getWhen = useRelativeChargeLabel();

  return (
    <Row sx={getChargeRowStyle()}>
      <ButtonBase
        onClick={() => onEdit(item)}
        aria-label={t('row.edit', { name: item.name })}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', borderRadius: 3, textAlign: 'start' }}
      >
        <Row alignItems="center" spacing={1.5} width="100%" sx={{ minWidth: 0 }}>
          <FixedExpenseThumbnail item={item} size={CHARGE_ICON_SIZE} />
          <Column spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography fontWeight={700} noWrap>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {getWhen(item.nextDate)}
            </Typography>
          </Column>
        </Row>
      </ButtonBase>
      <CurrencyText value={item.amount} fontWeight={700} sx={{ flexShrink: 0 }} />
      {item.kind === 'subscription' && (
        <Button
          size="small"
          variant="outlined"
          endIcon={<CallMadeIcon sx={{ fontSize: 14 }} />}
          onClick={() => onCancel(item)}
          sx={getPillButtonStyle()}
        >
          {t('row.cancel')}
        </Button>
      )}
    </Row>
  );
};

export default ChargeRow;
