import CategoryIcon from '@mui/icons-material/Category';
import { ButtonBase, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import TransactionSubtitle from '@/components/features/transactions/TransactionSubtitle';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { categoryIconMap } from '@/constants/categoryIconMap';
import { FIT_ROW_ATTRIBUTE } from '@/hooks/common/useFittingRowCount';
import { ExpandedTransactionDto } from '@/types/Transaction';
import { getTransactionAmountColor } from '@/utils/entities/transaction';

interface RecentTransactionRowProps {
  transaction: ExpandedTransactionDto;
  onSelect: (transaction: ExpandedTransactionDto) => void;
}

const RecentTransactionRow = ({ transaction, onSelect }: RecentTransactionRowProps) => {
  const { t } = useTranslation('overview');
  const IconComponent =
    (transaction.category?.icon && categoryIconMap[transaction.category.icon]) || CategoryIcon;
  const title =
    transaction.type === 'Transfer' ? t('recentTransactions.transfer') : transaction.name;

  return (
    <ButtonBase
      {...{ [FIT_ROW_ATTRIBUTE]: true }}
      onClick={() => onSelect(transaction)}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        textAlign: 'start',
        borderRadius: 2,
        px: 1,
        py: 0.75,
        gap: 1.5,
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      <Column
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          backgroundColor: 'action.selected',
          flexShrink: 0,
        }}
      >
        <IconComponent sx={{ color: transaction.category?.color }} />
      </Column>
      <Column sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {title}
        </Typography>
        <TransactionSubtitle transaction={transaction} />
      </Column>
      <Row sx={{ flexShrink: 0 }}>
        <CurrencyText
          variant="body1"
          fontWeight={700}
          value={transaction.amount}
          color={getTransactionAmountColor(transaction)}
        />
      </Row>
    </ButtonBase>
  );
};

export default RecentTransactionRow;
