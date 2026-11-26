import { useMediaQuery, useTheme } from '@mui/material';

import CompactSummaryCard from '@/pages/FixedExpenses/CompactSummaryCard';
import WideSummaryCards from '@/pages/FixedExpenses/WideSummaryCards';
import { FixedExpenseDto, FixedExpenseListDto } from '@/types/FixedExpense';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';

export interface FixedExpensesSummaryProps {
  totals: FixedExpenseListDto['totals'];
  groups: FixedExpenseGroup[];
  nextCharge: FixedExpenseDto;
}

const FixedExpensesSummary = (props: FixedExpensesSummaryProps) => {
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));

  return isWide ? <WideSummaryCards {...props} /> : <CompactSummaryCard {...props} />;
};

export default FixedExpensesSummary;
