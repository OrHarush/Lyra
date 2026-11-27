import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LaunchIcon from '@mui/icons-material/Launch';
import { alpha, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import AwaitingApprovalChip from '@/components/features/bills/AwaitingApprovalChip';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import EditAndDeleteButtons from '@/components/shared/ui/EditAndDeleteButtons';
import { bankAccountIconMap } from '@/constants/BankAccountIcons';
import { useCategoryName } from '@/hooks/entities/useCategoryName';
import { useGoals } from '@/hooks/entities/useGoals';
import RecurrenceBadge from '@/pages/Transactions/components/RecurrenceBadge';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import CategoryChip from '@/pages/Transactions/TransactionsPreview/CategoryChip';
import TransactionNoteIcon from '@/pages/Transactions/TransactionsPreview/TransactionNoteIcon';
import { useSnackbar } from '@/providers/SnackbarProvider';
import { ExpandedTransactionDto } from '@/types/Transaction';
import { isToday } from '@/utils/date';
import { getAccountDisplayName } from '@/utils/entities/account';
import { getPaymentMethodDisplayName } from '@/utils/entities/paymentMethod';
import { getTransactionDisplayDate, isTransactionNeedsReview } from '@/utils/entities/transaction';

interface TransactionTableRowProps {
  transaction: ExpandedTransactionDto;
}

const TransactionTableRow = ({ transaction }: TransactionTableRowProps) => {
  const { t } = useTranslation('paymentMethods');
  const { t: tTx } = useTranslation('transactions');
  const { t: tAccounts } = useTranslation('accounts');
  const { t: tGoals } = useTranslation('goals');
  const navigate = useNavigate();
  const { setSelectedTransaction, setTransactionAction } = useTransactionPageData();
  const getCategoryName = useCategoryName();
  const { alertError } = useSnackbar();
  const { goals } = useGoals();

  const linkedGoal =
    transaction.category?.type === 'Savings'
      ? goals.find(g => g.categoryId === transaction.category?._id)
      : undefined;

  const openLinkedGoal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (linkedGoal) {
      navigate(`/goals/${linkedGoal._id}`);
    }
  };

  const handleTransactionDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (transaction.isVirtual) {
      alertError(tTx('messages.cannotDeleteVirtual'));
      return;
    }

    setTransactionAction('delete');
    setSelectedTransaction(transaction);
  };

  const handleTransactionSelect = () => {
    setSelectedTransaction(transaction);
    setTransactionAction('edit');
  };

  const isTodayTransaction = isToday(new Date(getTransactionDisplayDate(transaction)));
  const needsReview = isTransactionNeedsReview(transaction);
  const AccountIconComponent =
    (transaction.account?.icon && bankAccountIconMap[transaction.account.icon]) ||
    AccountBalanceIcon;

  return (
    <TableRow
      key={transaction._id}
      onClick={handleTransactionSelect}
      sx={{
        cursor: 'pointer',
        borderLeft: needsReview || isTodayTransaction ? '4px solid' : 'none',
        borderLeftColor: 'primary.main',
        backgroundColor: needsReview
          ? theme => alpha(theme.palette.primary.main, 0.1)
          : isTodayTransaction
            ? 'rgba(56, 189, 248, 0.08)'
            : 'transparent',
        '&:hover': {
          backgroundColor: needsReview
            ? theme => alpha(theme.palette.primary.main, 0.16)
            : isTodayTransaction
              ? 'rgba(56, 189, 248, 0.15)'
              : 'action.hover',
        },
        transition: 'background-color 0.2s ease',
      }}
    >
      <TableCell>
        <Row alignItems="center" spacing={1}>
          <Typography variant="body2" noWrap>
            {transaction.type === 'Transfer' ? tTx('types.transfer') : transaction.name}
          </Typography>
          <RecurrenceBadge transaction={transaction} />
          {transaction.isAwaitingApproval && <AwaitingApprovalChip transaction={transaction} />}
          {transaction.note && <TransactionNoteIcon note={transaction.note} />}
        </Row>
      </TableCell>
      <TableCell align="left">
        <CurrencyText
          value={transaction.amount}
          color={
            transaction.type === 'Transfer'
              ? transaction.account?._id === transaction.fromAccount?._id
                ? 'error.main'
                : 'success.main'
              : transaction?.type === 'Expense'
                ? 'error.main'
                : 'success.main'
          }
        />
      </TableCell>
      <TableCell align="left">
        <CategoryChip
          name={
            transaction.type === 'Transfer'
              ? tTx('types.transfer')
              : getCategoryName(transaction.category)
          }
          color={transaction.category?.color || '#c8c8c8'}
          icon={transaction.category?.icon}
        />
      </TableCell>
      <TableCell align="left">
        <Row alignItems="center" spacing={1}>
          <AccountIconComponent sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
          <Typography variant="body2" noWrap>
            {getAccountDisplayName(transaction.account, tAccounts)}
          </Typography>
        </Row>
      </TableCell>
      <TableCell align="left">
        <Typography variant="body2" noWrap>
          {getPaymentMethodDisplayName(transaction.paymentMethod, t)}
        </Typography>
      </TableCell>
      <TableCell align="left">
        {new Date(getTransactionDisplayDate(transaction)).toLocaleDateString('en-GB')}
      </TableCell>
      <TableCell align="center">
        <Row justifyContent="center">
          {linkedGoal && (
            <Tooltip title={tGoals('ghosts.actions.openGoal')}>
              <IconButton
                onClick={openLinkedGoal}
                size="medium"
                aria-label={tGoals('ghosts.actions.openGoal')}
              >
                <LaunchIcon
                  fontSize="small"
                  sx={{ color: linkedGoal.color ?? 'primary.main' }}
                />
              </IconButton>
            </Tooltip>
          )}
          <EditAndDeleteButtons
            onDelete={e => handleTransactionDelete(e)}
            onEdit={handleTransactionSelect}
          />
        </Row>
      </TableCell>
    </TableRow>
  );
};

export default TransactionTableRow;
