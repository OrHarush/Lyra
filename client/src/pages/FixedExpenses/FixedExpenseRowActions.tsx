import { FixedExpenseKind } from '@lyra/shared';
import CallMadeIcon from '@mui/icons-material/CallMade';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button, Chip, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { getCancelButtonStyle, getQuickChipStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

const QUICK_KINDS = ['subscription', 'bill'] as const satisfies readonly FixedExpenseKind[];

interface FixedExpenseRowActionsProps {
  item: FixedExpenseDto;
  isClassifying: boolean;
  onClassify: (item: FixedExpenseDto, kind: FixedExpenseKind) => void;
  onCancel: (item: FixedExpenseDto) => void;
  onEdit: (item: FixedExpenseDto) => void;
}

const FixedExpenseRowActions = ({
  item,
  isClassifying,
  onClassify,
  onCancel,
  onEdit,
}: FixedExpenseRowActionsProps) => {
  const { t } = useTranslation('fixedExpenses');
  const { t: tTransactions } = useTranslation('transactions');

  return (
    <Row spacing={0.75} alignItems="center" justifyContent="flex-end">
      {item.kind === null && (
        <Row spacing={0.5} role="group" aria-label={t('row.markAs', { name: item.name })}>
          {QUICK_KINDS.map(kind => (
            <Chip
              key={kind}
              size="small"
              variant="outlined"
              color="primary"
              label={tTransactions(`fixedExpense.kinds.${kind}`)}
              disabled={isClassifying}
              onClick={() => onClassify(item, kind)}
              sx={getQuickChipStyle()}
            />
          ))}
        </Row>
      )}
      {item.kind === 'subscription' && (
        <Button
          size="small"
          variant="outlined"
          endIcon={<CallMadeIcon sx={{ fontSize: 14 }} />}
          onClick={() => onCancel(item)}
          sx={getCancelButtonStyle()}
        >
          {t('row.cancel')}
        </Button>
      )}
      <IconButton size="small" aria-label={t('row.edit', { name: item.name })} onClick={() => onEdit(item)}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
    </Row>
  );
};

export default FixedExpenseRowActions;
