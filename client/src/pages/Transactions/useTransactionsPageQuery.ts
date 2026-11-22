import { useTransactions } from '@/hooks/entities/useTransactions';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';

export const useTransactionsPageQuery = () => {
  const {
    selectedMonth,
    selectedCategoryIds,
    selectedAccountIds,
    selectedPaymentMethodIds,
    selectedType,
    search,
    page,
    pageSize,
  } = useTransactionPageData();

  return useTransactions(
    selectedMonth.year(),
    selectedMonth.month(),
    search,
    selectedCategoryIds,
    selectedAccountIds,
    selectedPaymentMethodIds,
    page,
    pageSize,
    selectedType
  );
};
