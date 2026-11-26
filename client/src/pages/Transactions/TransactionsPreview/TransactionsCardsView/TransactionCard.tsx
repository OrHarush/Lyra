import CategoryIcon from '@mui/icons-material/Category';
import { Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import AwaitingApprovalChip from '@/components/features/bills/AwaitingApprovalChip';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import SwipeableCard from '@/components/shared/ui/SwipeableCard';
import { categoryIconMap } from '@/constants/categoryIconMap';
import RecurrenceBadge from '@/pages/Transactions/components/RecurrenceBadge';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import TransactionNoteIcon from '@/pages/Transactions/TransactionsPreview/TransactionNoteIcon';
import { getCardStyles } from '@/pages/Transactions/TransactionsPreview/TransactionsCardsView/styles';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ExpandedTransactionDto } from '@/types/Transaction';
import { isToday } from '@/utils/date';
import { getTransactionDisplayDate, isTransactionNeedsReview } from '@/utils/entities/transaction';

interface TransactionCardViewProps {
  transaction: ExpandedTransactionDto;
}

const TransactionCard = ({ transaction }: TransactionCardViewProps) => {
  const { setSelectedTransaction, setTransactionAction } = useTransactionPageData();
  const { alertError } = useSnackbar();
  const { t: tTx } = useTranslation('transactions');
  const IconComponent =
    (transaction.category?.icon && categoryIconMap[transaction.category?.icon]) || CategoryIcon;

  const isTodayTransaction = isToday(new Date(getTransactionDisplayDate(transaction)));
  const needsReview = isTransactionNeedsReview(transaction);
  const isTransfer = transaction.type === 'Transfer';

  const amountColor = isTransfer
    ? transaction.account?._id === transaction.fromAccount?._id
      ? 'error.main'
      : 'success.main'
    : transaction.type === 'Expense'
      ? 'error.main'
      : 'success.main';

  const setTransactionToEdit = () => {
    setSelectedTransaction(transaction);
    setTransactionAction('edit');
  };

  const setTransactionToDelete = () => {
    if (transaction.isVirtual) {
      alertError(tTx('messages.cannotDeleteVirtual'));
      return;
    }

    setSelectedTransaction(transaction);
    setTransactionAction('delete');
  };

  return (
    <SwipeableCard onDelete={setTransactionToDelete}>
      <Paper
        key={transaction._id}
        onClick={setTransactionToEdit}
        sx={getCardStyles(isTodayTransaction, needsReview)}
      >
        <Column
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            backgroundColor: 'action.selected',
            flexShrink: 0,
          }}
        >
          <IconComponent
            color={transaction.category?.color}
            sx={{ color: transaction.category?.color }}
          />
        </Column>
        <Row width={'100%'} justifyContent={'space-between'} alignItems={'center'}>
          <Column alignItems={'flex-start'}>
            <Row alignItems={'center'} spacing={1}>
              <Typography
                variant="body2"
                fontWeight={500}
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isTransfer ? 'Transfer' : transaction.name}
              </Typography>
              <RecurrenceBadge transaction={transaction} />
              {transaction.note && <TransactionNoteIcon note={transaction.note} />}
            </Row>
            <Typography variant="caption" color="text.secondary">
              {dayjs(getTransactionDisplayDate(transaction)).format('DD/MM/YYYY')}
            </Typography>
            {transaction.isAwaitingApproval && <AwaitingApprovalChip transaction={transaction} />}
          </Column>
          <CurrencyText
            variant="body1"
            fontWeight={700}
            value={transaction.amount}
            color={amountColor}
            sx={{ ml: 1.5, flexShrink: 0 }}
          />
        </Row>
      </Paper>
    </SwipeableCard>
  );
};

export default TransactionCard;
