import { Chip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Row from '@/components/shared/layout/containers/Row';
import { FixedExpenseDto } from '@/types/FixedExpense';

const FixedExpenseName = ({ item }: { item: FixedExpenseDto }) => {
  const { t } = useTranslation('transactions');
  const hasKindLabel = item.kind === 'subscription' || item.kind === 'bill';

  return (
    <Row alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
      <Typography fontWeight={600} noWrap>
        {item.name}
      </Typography>
      {hasKindLabel && (
        <Chip
          size="small"
          label={t(`fixedExpense.kinds.${item.kind}`)}
          sx={{ height: 20, fontSize: '0.7rem', flexShrink: 0 }}
        />
      )}
    </Row>
  );
};

export default FixedExpenseName;
