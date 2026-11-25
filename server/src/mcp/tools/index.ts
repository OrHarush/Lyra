import { analyzeSpending } from './analyzeSpending';
import { getCashflow } from './getCashflow';
import { getGoals } from './getGoals';
import { getInvestments } from './getInvestments';
import { getOverview } from './getOverview';
import { searchTransactions } from './searchTransactions';

export const MCP_TOOLS = [
  getOverview,
  searchTransactions,
  analyzeSpending,
  getCashflow,
  getGoals,
  getInvestments,
] as const;
