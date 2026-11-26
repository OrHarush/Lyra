import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { getFixedExpenseIcon } from '@/utils/entities/fixedExpenseIcons';

interface FixedExpenseThumbnailProps {
  item: FixedExpenseDto;
  size: number;
}

const FixedExpenseThumbnail = ({ item, size }: FixedExpenseThumbnailProps) => {
  const iconName = getFixedExpenseIcon(item);

  if (!iconName) {
    return <CategoryIconFrame color={item.category?.color} icon={item.category?.icon} />;
  }

  return <FixedExpenseIcon name={iconName} size={size} hasTile />;
};

export default FixedExpenseThumbnail;
