import { Box, Typography } from '@mui/material';

import TransactionSubtitle from '@/components/features/transactions/TransactionSubtitle';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { TransactionDto } from '@/types/Transaction';

const TransactionPreviewItem = ({ tx }: { tx: TransactionDto }) => (
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
          {tx.name || '—'}
        </Typography>
        <TransactionSubtitle transaction={tx} />
      </Column>
      <Typography
        variant="body2"
        fontWeight={600}
        color={tx.type === 'Income' ? 'success.main' : 'error.main'}
        sx={{ ml: 2, flexShrink: 0 }}
        dir="ltr"
      >
        {tx.type === 'Income' ? '+' : '-'}₪{tx.amount.toLocaleString()}
      </Typography>
    </Row>
  </Box>
);

export default TransactionPreviewItem;
