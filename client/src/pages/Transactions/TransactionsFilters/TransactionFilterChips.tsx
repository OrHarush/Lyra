import Row from '@/components/shared/layout/containers/Row';
import AccountFilter from '@/pages/Transactions/TransactionsFilters/AccountFilter';
import CategoryFilter from '@/pages/Transactions/TransactionsFilters/CategoryFilter';
import PaymentMethodFilter from '@/pages/Transactions/TransactionsFilters/PaymentMethodFilter';

interface TransactionFilterChipsProps {
  selectedCategoryIds: string[];
  selectedAccountIds: string[];
  selectedPaymentMethodIds: string[];
  onCategoryChange: (ids: string[]) => void;
  onAccountChange: (ids: string[]) => void;
  onPaymentMethodChange: (ids: string[]) => void;
}

const TransactionFilterChips = ({
  selectedCategoryIds,
  selectedAccountIds,
  selectedPaymentMethodIds,
  onCategoryChange,
  onAccountChange,
  onPaymentMethodChange,
}: TransactionFilterChipsProps) => (
  <Row spacing={1} flexWrap="wrap" useFlexGap>
    <CategoryFilter selectedIds={selectedCategoryIds} onChange={onCategoryChange} />
    <AccountFilter selectedIds={selectedAccountIds} onChange={onAccountChange} />
    <PaymentMethodFilter selectedIds={selectedPaymentMethodIds} onChange={onPaymentMethodChange} />
  </Row>
);

export default TransactionFilterChips;
