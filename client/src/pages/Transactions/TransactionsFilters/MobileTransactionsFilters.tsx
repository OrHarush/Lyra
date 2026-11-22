import { Box, useMediaQuery, useTheme } from '@mui/material';

import Column from '@/components/shared/layout/containers/Column';
import { useTransactionPageData } from '@/pages/Transactions/TransactionPageDataProvider';
import ClearFiltersChip from '@/pages/Transactions/TransactionsFilters/ClearFiltersChip ';
import TransactionFilterChips from '@/pages/Transactions/TransactionsFilters/TransactionFilterChips';
import TransactionSearchInput from '@/pages/Transactions/TransactionsFilters/TransactionSearchInput';

const MobileTransactionsFilters = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
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
    <Column width="100%" spacing={1} alignItems="center">
      <TransactionSearchInput />
      <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flex: 1,
            justifyContent: isXs ? 'center' : 'flex-start',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <TransactionFilterChips
            selectedCategoryIds={selectedCategoryIds}
            selectedAccountIds={selectedAccountIds}
            selectedPaymentMethodIds={selectedPaymentMethodIds}
            onCategoryChange={setSelectedCategoryIds}
            onAccountChange={setSelectedAccountIds}
            onPaymentMethodChange={setSelectedPaymentMethodIds}
          />
        </Box>
        {activeFilterCount > 0 && <ClearFiltersChip onClick={resetFilters} iconOnly />}
      </Box>
    </Column>
  );
};

export default MobileTransactionsFilters;
