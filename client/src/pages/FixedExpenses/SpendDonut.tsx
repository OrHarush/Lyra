import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Column from '@/components/shared/layout/containers/Column';
import CurrencyText from '@/components/shared/ui/CurrencyText';
import { getGroupColor } from '@/pages/FixedExpenses/styles';
import { FixedExpenseGroup } from '@/utils/entities/fixedExpenseGroups';

interface SpendDonutProps {
  groups: FixedExpenseGroup[];
  monthly: number;
  size: number;
}

const STROKE = 16;
const VIEW = 160;
const RADIUS = (VIEW - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Keeps slivers visible: a round cap on a tiny arc still reads as a dot.
const MIN_ARC = 1;

const SpendDonut = ({ groups, monthly, size }: SpendDonutProps) => {
  const { t } = useTranslation('fixedExpenses');
  const theme = useTheme();
  let offset = 0;

  const arcs = groups.map(group => {
    const length = Math.max(group.share * CIRCUMFERENCE, MIN_ARC);
    const arc = { id: group.id, length, offset };
    offset += group.share * CIRCUMFERENCE;

    return arc;
  });

  return (
    <Box
      role="img"
      aria-label={t('summary.split')}
      sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${VIEW} ${VIEW}`}>
        <g transform={`rotate(-90 ${VIEW / 2} ${VIEW / 2})`}>
          {arcs.map(arc => (
            <circle
              key={arc.id}
              cx={VIEW / 2}
              cy={VIEW / 2}
              r={RADIUS}
              fill="none"
              stroke={getGroupColor(arc.id)(theme)}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={-arc.offset}
            />
          ))}
        </g>
      </svg>
      <Column
        alignItems="center"
        justifyContent="center"
        sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <CurrencyText value={monthly} variant="h6" fontWeight={700} />
        <Typography variant="caption" color="text.secondary">
          {t('summary.perMonth')}
        </Typography>
      </Column>
    </Box>
  );
};

export default SpendDonut;
