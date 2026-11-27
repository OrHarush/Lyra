import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TransactionSubtitle from '@/components/features/transactions/TransactionSubtitle';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { TransactionDto } from '@/types/Transaction';
import { getAccountDisplayName } from '@/utils/entities/account';

const TransactionPreviewItem = ({ tx }: { tx: TransactionDto }) => {
  const { t } = useTranslation('accounts');
  const isTransfer = tx.type === 'Transfer';
  const title = isTransfer
    ? `${getAccountDisplayName(tx.fromAccount, t)} ↔ ${getAccountDisplayName(tx.toAccount, t)}`
    : tx.name || '—';

  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1,
        backgroundColor: 'action.hover',
        '&:hover': { backgroundColor: 'action.selected' },
      }}
    >
      <Row justifyContent="space-between" alignItems="center">
        <Column spacing={0}>
          <Typography variant="body2" fontWeight={500}>
            {title}
          </Typography>
          <TransactionSubtitle transaction={tx} />
        </Column>
        <CurrencyText
          variant="body2"
          fontWeight={600}
          value={tx.type === 'Expense' ? -tx.amount : tx.amount}
          hasSign={!isTransfer}
          hasColor={!isTransfer}
          sx={{ ml: 2, flexShrink: 0 }}
        />
      </Row>
    </Box>
  );
};

export default TransactionPreviewItem;
