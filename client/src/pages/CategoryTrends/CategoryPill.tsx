import { alpha, ButtonBase, Typography, useTheme } from '@mui/material';

import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import TrendArrow from '@/components/features/categoryTrends/TrendArrow';
import Row from '@/components/shared/layout/containers/Row';
import { TrendPill } from '@/pages/CategoryTrends/useCategoryTrendsPage';

interface CategoryPillProps {
  pill: TrendPill;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
}

const PILL_NAME_MAX_WIDTH = 120;

const CategoryPill = ({ pill, isSelected, onSelect }: CategoryPillProps) => {
  const theme = useTheme();

  return (
    <ButtonBase
      aria-pressed={isSelected}
      title={pill.name}
      onClick={() => onSelect(pill.id)}
      sx={{
        flexShrink: 0,
        borderRadius: '40px',
        px: 1.5,
        py: 0.5,
        border: '2px solid',
        borderColor: isSelected
          ? theme.palette.primary.main
          : alpha(theme.palette.text.primary, 0.12),
        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        transition: 'border-color 160ms ease, background-color 160ms ease',
        '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.5) },
      }}
    >
      <Row alignItems="center" spacing={1}>
        <CategoryIconFrame color={pill.color} icon={pill.icon} />
        <Typography variant="body2" fontWeight={600} noWrap maxWidth={PILL_NAME_MAX_WIDTH}>
          {pill.name}
        </Typography>
        <TrendArrow delta={pill.delta} />
      </Row>
    </ButtonBase>
  );
};

export default CategoryPill;
