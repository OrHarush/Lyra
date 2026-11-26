import CategoryIconFrame from '@/components/features/categories/CategoryIconFrame';
import CoinIcon from '@/components/features/fixedExpenses/CoinIcon';
import FixedExpenseIcon from '@/components/features/fixedExpenses/FixedExpenseIcon';
import Row from '@/components/shared/layout/containers/Row';
import { FixedExpenseDto } from '@/types/FixedExpense';
import { getFixedExpenseArtwork } from '@/utils/entities/fixedExpenseIcons';

interface FixedExpenseThumbnailProps {
  item: FixedExpenseDto;
  size: number;
}

const FixedExpenseThumbnail = ({ item, size }: FixedExpenseThumbnailProps) => {
  const artwork = getFixedExpenseArtwork(item);

  if (!artwork) {
    return (
      <Row justifyContent="center" alignItems="center" width={size} flexShrink={0}>
        <CategoryIconFrame color={item.category?.color} icon={item.category?.icon} />
      </Row>
    );
  }

  if (artwork === 'coin') {
    return <CoinIcon size={size} />;
  }

  return <FixedExpenseIcon name={artwork} size={size} />;
};

export default FixedExpenseThumbnail;
