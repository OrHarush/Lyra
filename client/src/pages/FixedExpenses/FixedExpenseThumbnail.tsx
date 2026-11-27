import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import Row from '@/components/shared/layout/containers/Row';
import { FixedExpenseDto } from '@/types/FixedExpense';

interface FixedExpenseThumbnailProps {
  item: FixedExpenseDto;
  size: number;
}

const FixedExpenseThumbnail = ({ item, size }: FixedExpenseThumbnailProps) => (
  <Row justifyContent="center" alignItems="center" width={size} flexShrink={0}>
    <CategoryIconFrame color={item.category?.color} icon={item.category?.icon} />
  </Row>
);

export default FixedExpenseThumbnail;
