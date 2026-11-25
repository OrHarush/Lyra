import { Chip, Typography } from '@mui/material';

import TrendArrow from '@/components/features/categoryTrends/TrendArrow';
import Row from '@/components/shared/layout/containers/Row';
import { TrendPill } from '@/pages/CategoryTrends/useCategoryTrendsPage';

interface CategoryPillProps {
  pill: TrendPill;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

const PILL_NAME_MAX_WIDTH = 120;

const CategoryPill = ({ pill, isSelected, onSelect }: CategoryPillProps) => (
  <Chip
    clickable
    aria-pressed={isSelected}
    title={pill.name}
    color={isSelected ? 'primary' : 'default'}
    variant={isSelected ? 'filled' : 'outlined'}
    onClick={() => onSelect(pill.id)}
    sx={{ flexShrink: 0, borderColor: isSelected ? undefined : pill.color }}
    label={
      <Row alignItems="center" spacing={0.5}>
        <Typography variant="body2" fontWeight={600} noWrap maxWidth={PILL_NAME_MAX_WIDTH}>
          {pill.name}
        </Typography>
        <TrendArrow delta={pill.delta} />
      </Row>
    }
  />
);

export default CategoryPill;
