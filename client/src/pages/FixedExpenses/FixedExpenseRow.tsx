import { FixedExpenseKind } from '@lyra/shared';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { useCategoryName } from '@/hooks/entities/useCategoryName';
import FixedExpenseName from '@/pages/FixedExpenses/FixedExpenseName';
import FixedExpenseRowActions from '@/pages/FixedExpenses/FixedExpenseRowActions';
import FixedExpenseThumbnail from '@/pages/FixedExpenses/FixedExpenseThumbnail';
import { getDesktopRowStyle, getMobileRowStyle } from '@/pages/FixedExpenses/styles';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface FixedExpenseRowProps {
  item: FixedExpenseDto;
  isClassifying: boolean;
  onClassify: (item: FixedExpenseDto, kind: FixedExpenseKind) => void;
  onCancel: (item: FixedExpenseDto) => void;
  onEdit: (item: FixedExpenseDto) => void;
}

const FixedExpenseRow = (props: FixedExpenseRowProps) => {
  const { item } = props;
  const { t: tTransactions } = useTranslation('transactions');
  const getCategoryName = useCategoryName();
  const theme = useTheme();
  // The one-line row needs the full 900px content width; narrower screens get two lines.
  const isOneLine = useMediaQuery(theme.breakpoints.up('lg'));

  const categoryName = item.category ? getCategoryName(item.category) : '';
  const frequency =
    item.frequency === 'Monthly'
      ? ''
      : ` · ${tTransactions(`recurrence.${item.frequency === 'Bimonthly' ? 'bimonthly' : 'yearly'}`)}`;
  const nextCharge = `${dayjs(item.nextDate).format('DD/MM')}${frequency}`;
  const actions = <FixedExpenseRowActions {...props} />;
  const thumbnail = <FixedExpenseThumbnail item={item} size={40} />;

  if (!isOneLine) {
    return (
      <Row sx={getMobileRowStyle()}>
        {thumbnail}
        <Column spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Row justifyContent="space-between" alignItems="center" spacing={1}>
            <FixedExpenseName item={item} />
            <CurrencyText value={item.amount} fontWeight={700} sx={{ flexShrink: 0 }} />
          </Row>
          <Row justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {[categoryName, nextCharge].filter(Boolean).join(' · ')}
            </Typography>
            {actions}
          </Row>
        </Column>
      </Row>
    );
  }

  return (
    <Box sx={getDesktopRowStyle()}>
      {thumbnail}
      <FixedExpenseName item={item} />
      <Typography variant="body2" color="text.secondary" noWrap>
        {categoryName}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {nextCharge}
      </Typography>
      <CurrencyText value={item.amount} fontWeight={700} />
      {actions}
    </Box>
  );
};

export default FixedExpenseRow;
