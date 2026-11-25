import { z } from 'zod';

import * as readModel from '../readModel';
import { defineTool, roundMoney, toIsoDay, UNTRUSTED_TEXT_NOTICE } from './toolKit';

const RECENT_CONTRIBUTION_MONTHS = 6;

export const getGoals = defineTool({
  name: 'getGoals',
  title: 'Savings goals',
  description:
    'Savings goals with progress and projection: target, current value, percent done, target date, ' +
    'months remaining, the monthly contribution required, the projected final value at the current ' +
    'pace, whether it is on track, the shortfall, and recent monthly contributions. ' +
    UNTRUSTED_TEXT_NOTICE,
  inputSchema: {
    status: z
      .enum(['active', 'achieved', 'archived', 'all'])
      .optional()
      .describe('Default active.'),
  },
  run: async ({ status }, { userId, workspaceId }) => {
    const requested = status ?? 'active';
    const goals = await readModel.listGoals(userId, workspaceId, {
      status: requested === 'all' ? undefined : requested,
    });

    const projections = await Promise.all(
      goals.map(goal => readModel.getGoalProjection(userId, workspaceId, String(goal._id)))
    );

    return {
      goals: projections.map(projection => {
        const { goal } = projection;

        return {
          name: goal.name,
          status: goal.status,
          importance: goal.importance,
          targetAmount: goal.targetAmount,
          currentValue: projection.currentValue,
          progressPercent:
            goal.targetAmount > 0
              ? Math.round((projection.currentValue / goal.targetAmount) * 100)
              : null,
          targetDate: toIsoDay(new Date(goal.targetDate)),
          monthsRemaining: projection.monthsRemaining,
          requiredMonthlyContribution: roundMoney(projection.requiredMonthlyContribution),
          projectedFinalValue: roundMoney(projection.projectedFinalValue),
          onTrack: projection.onTrack,
          shortfall: roundMoney(projection.shortfall),
          expectedAnnualReturnPercent: goal.expectedAnnualReturn,
          recentContributions: projection.contributionsByMonth.slice(-RECENT_CONTRIBUTION_MONTHS),
        };
      }),
    };
  },
});
