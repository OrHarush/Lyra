import { Box, Card, CardActionArea, CardContent, Chip, LinearProgress, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import Column from '@/components/shared/layout/containers/Column';
import Row from '@/components/shared/layout/containers/Row';
import { formatGoalAmount } from '@/pages/Goals/utils/goalFormatters';
import {
  monthsBetweenUtc,
  requiredMonthlyContribution,
  startOfTodayUtc,
} from '@/pages/Goals/utils/goalPreview';
import type { GoalListItemDto } from '@/types/Goal';

interface GoalCardProps {
  goal: GoalListItemDto;
}

const FALLBACK_COLOR = '#9ca3af';

const computeProgressPercent = (current: number, target: number): number => {
  if (target <= 0) {
    return 0;
  }

  return Math.min((current / target) * 100, 100);
};

const resolveStatusText = (
  goal: GoalListItemDto,
  monthsRemaining: number,
  monthlyRequired: number,
  t: TFunction
): string => {
  if (goal.currentValue >= goal.targetAmount) {
    return t('cards.achieved');
  }

  if (monthsRemaining === 0) {
    return t('cards.dueToday', {
      remaining: formatGoalAmount(goal.targetAmount - goal.currentValue),
    });
  }

  return t('cards.statusActive', {
    months: monthsRemaining,
    monthly: formatGoalAmount(monthlyRequired),
  });
};

const GoalCard = ({ goal }: GoalCardProps) => {
  const { t } = useTranslation('goals');
  const navigate = useNavigate();

  const percent = computeProgressPercent(goal.currentValue, goal.targetAmount);
  const monthsRemaining = monthsBetweenUtc(startOfTodayUtc(), new Date(goal.targetDate));
  const required = requiredMonthlyContribution(
    goal.currentValue,
    goal.targetAmount,
    monthsRemaining,
    goal.expectedAnnualReturn
  );
  const goalColor = goal.color ?? goal.category?.color ?? FALLBACK_COLOR;
  const statusText = resolveStatusText(goal, monthsRemaining, required, t);

  const goToDetail = () => navigate(`/goals/${goal._id}`);

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': { borderColor: goalColor, boxShadow: 2 },
      }}
    >
      <CardActionArea onClick={goToDetail}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Column spacing={1.5}>
            <Row spacing={1.5} alignItems="center">
              <CategoryIconFrame icon={goal.icon ?? undefined} color={goalColor} />
              <Column flex={1} spacing={0.25} sx={{ minWidth: 0 }}>
                <Row alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {goal.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={t(`importance.${goal.importance}`)}
                    sx={{ height: 20, fontSize: 10 }}
                  />
                </Row>
              </Column>
            </Row>

            <Row alignItems="baseline" spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                {formatGoalAmount(goal.currentValue)} ₪
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / {formatGoalAmount(goal.targetAmount)} ₪
              </Typography>
            </Row>

            <Box>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': { backgroundColor: goalColor },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {percent.toFixed(0)}%
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
              {statusText}
            </Typography>

            <Typography variant="caption" color="text.disabled">
              {t('cards.targetDate', { date: dayjs(goal.targetDate).format('DD/MM/YYYY') })}
            </Typography>
          </Column>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GoalCard;
