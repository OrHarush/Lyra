import CategoryIcon from '@mui/icons-material/Category';
import { Typography } from '@mui/material';
import { ElementType } from 'react';
import { useTranslation } from 'react-i18next';

import MultiSelectChip from '@/components/shared/inputs/MultiSelectChip';
import { buildGroupedItems } from '@/components/shared/inputs/MultiSelectChip/buildGroupedItems';
import { MultiSelectChipItem } from '@/components/shared/inputs/MultiSelectChip/MultiSelectChipList';
import Row from '@/components/shared/layout/containers/Row';
import { categoryIconMap } from '@/constants/categoryIconMap';
import { useCategories } from '@/hooks/entities/useCategories';
import { useCategoryName } from '@/hooks/entities/useCategoryName';
import { CategoryDto } from '@/types/Category';

interface CategoryFilterProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const resolveCategoryIcon = (category: CategoryDto): ElementType =>
  (category.icon && categoryIconMap[category.icon]) || CategoryIcon;

const CategoryFilter = ({ selectedIds, onChange }: CategoryFilterProps) => {
  const { t } = useTranslation('transactions');
  const { categories } = useCategories();
  const getCategoryName = useCategoryName();

  const toCategoryOption = (cat: CategoryDto): MultiSelectChipItem => {
    const IconComponent = resolveCategoryIcon(cat);

    return {
      id: cat._id,
      renderRow: () => (
        <Row spacing={1.5} alignItems="center">
          <IconComponent sx={{ color: cat.color, fontSize: '20px' }} />
          <Typography variant="body2">{getCategoryName(cat)}</Typography>
        </Row>
      ),
    };
  };

  const categoryOptions = buildGroupedItems([
    {
      label: t('typeToggle.expenses'),
      items: categories.filter(cat => cat.type !== 'Income').map(toCategoryOption),
    },
    {
      label: t('typeToggle.income'),
      items: categories.filter(cat => cat.type === 'Income').map(toCategoryOption),
    },
  ]);

  const soleSelectedCategory =
    selectedIds.length === 1 ? categories.find(c => c._id === selectedIds[0]) : undefined;

  const chipLabel = (() => {
    if (selectedIds.length === 0) {
      return t('filters.allCategories');
    }

    if (soleSelectedCategory) {
      return getCategoryName(soleSelectedCategory);
    }

    return t('filters.selectedCategories', { count: selectedIds.length });
  })();

  const chipIcon = (() => {
    if (!soleSelectedCategory) {
      return <CategoryIcon />;
    }

    const SoleIcon = resolveCategoryIcon(soleSelectedCategory);

    return <SoleIcon sx={{ color: soleSelectedCategory.color }} />;
  })();

  return (
    <MultiSelectChip
      label={chipLabel}
      icon={chipIcon}
      selectedIds={selectedIds}
      onChange={onChange}
      items={categoryOptions}
    />
  );
};

export default CategoryFilter;
