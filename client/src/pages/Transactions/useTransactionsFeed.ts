import { useIsSmallScreen } from '@/hooks/common/useIsSmallScreen';
import { useInfiniteTransactions } from '@/hooks/entities/useInfiniteTransactions';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import { useTransactionsPageQuery } from '@/pages/Transactions/useTransactionsPageQuery';

// Mobile scrolls through one growing list; larger screens page through the same results.
export const useTransactionsFeed = () => {
  const isSmallScreen = useIsSmallScreen();
  const {
    selectedMonth,
    selectedCategoryIds,
    selectedAccountIds,
    selectedPaymentMethodIds,
    selectedType,
    search,
  } = useTransactionPageData();

  const paged = useTransactionsPageQuery(!isSmallScreen);
  const infinite = useInfiniteTransactions(
    {
      year: selectedMonth.year(),
      month: selectedMonth.month(),
      search,
      categoryIds: selectedCategoryIds,
      accountIds: selectedAccountIds,
      paymentMethodIds: selectedPaymentMethodIds,
      type: selectedType,
    },
    isSmallScreen
  );

  if (isSmallScreen) {
    return { ...infinite, pagination: undefined };
  }

  return {
    ...paged,
    fetchNextPage: undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
  };
};
