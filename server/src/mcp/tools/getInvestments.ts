import { z } from 'zod';

import * as readModel from '../readModel';
import { defineTool, roundMoney } from './toolKit';

const MAX_HISTORY_POINTS = 60;

type InvestmentHistory = Awaited<ReturnType<typeof readModel.getInvestmentHistory>>;

export const getInvestments = defineTool({
  name: 'getInvestments',
  title: 'Investment portfolio',
  description:
    "The user's investment portfolio tracked in Lyra: totals (invested, current value, profit/loss in " +
    'ILS), each fund or stock with its value, profit/loss and allocation, and optionally the value ' +
    'history. Investments belong to the user personally, so they are only available when the ' +
    'connection is to the personal workspace. Prices come from market data and may be delayed ' +
    '(see pricesAsOf / stale).',
  inputSchema: {
    history: z
      .enum(['3M', '1Y', 'ALL'])
      .optional()
      .describe('Include portfolio value history for this range. Omit for no history.'),
  },
  run: async ({ history }, { userId, workspaceId }) => {
    const workspace = await readModel.findWorkspace(workspaceId);

    if (workspace.type !== 'personal') {
      return {
        available: false,
        reason:
          'Investments are personal. This connection is to a shared workspace; reconnect and choose the personal workspace to see them.',
      };
    }

    const [summary, series] = await Promise.all([
      readModel.getInvestmentSummary(userId),
      history ? readModel.getInvestmentHistory(userId, { range: history }) : undefined,
    ]);

    return {
      available: true,
      totals: summary.totals,
      holdings: summary.funds.map(fund => ({
        name: fund.displayName,
        currency: fund.currency,
        invested: fund.invested,
        value: fund.value,
        profit: fund.pl,
        profitPercent: fund.plPct,
        valueIls: fund.valueIls,
        allocationPercent: fund.allocationPct,
      })),
      usdIls: summary.usdIls,
      pricesAsOf: summary.pricesAsOf,
      stale: summary.stale,
      hasMissingPrices: summary.hasMissingPrices,
      history: series ? presentHistory(series) : undefined,
    };
  },
});

const presentHistory = (history: InvestmentHistory) => {
  const step = Math.max(1, Math.ceil(history.series.length / MAX_HISTORY_POINTS));
  const sampled = history.series.filter(
    (_, index) => index % step === 0 || index === history.series.length - 1
  );

  return {
    stale: history.stale,
    points: sampled.map(point => ({
      date: point.date,
      invested: roundMoney(point.invested),
      value: roundMoney(point.value),
    })),
  };
};
