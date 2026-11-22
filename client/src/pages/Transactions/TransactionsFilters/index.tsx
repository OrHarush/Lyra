import Row from '@/components/shared/layout/containers/Row';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import ClearFiltersChip from '@/pages/Transactions/TransactionsFilters/ClearFiltersChip ';
import TransactionFilterChips from '@/pages/Transactions/TransactionsFilters/TransactionFilterChips';

const TransactionsFilters = () => {
  const {
    selectedCategoryIds,
    setSelectedCategoryIds,
    selectedAccountIds,
    setSelectedAccountIds,
    selectedPaymentMethodIds,
    setSelectedPaymentMethodIds,
    activeFilterCount,
    resetFilters,
  } = useTransactionPageData();

  return (
    <Row spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ flex: 1, minWidth: 0 }}>
      <TransactionFilterChips
        selectedCategoryIds={selectedCategoryIds}
        selectedAccountIds={selectedAccountIds}
        selectedPaymentMethodIds={selectedPaymentMethodIds}
        onCategoryChange={setSelectedCategoryIds}
        onAccountChange={setSelectedAccountIds}
        onPaymentMethodChange={setSelectedPaymentMethodIds}
      />
      {activeFilterCount > 0 && <ClearFiltersChip onClick={resetFilters} />}
    </Row>
  );
};

export default TransactionsFilters;
