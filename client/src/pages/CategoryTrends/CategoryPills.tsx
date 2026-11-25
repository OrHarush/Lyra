import { useEffect, useRef } from 'react';

import Row from '@/components/shared/layout/containers/Row';
import CategoryPill from '@/pages/CategoryTrends/CategoryPill';
import { TrendPill } from '@/pages/CategoryTrends/useCategoryTrendsPage';

interface CategoryPillsProps {
  pills: TrendPill[];
  selectedId: string | undefined;
  onSelect: (categoryId: string) => void;
  ariaLabel: string;
}

const CategoryPills = ({ pills, selectedId, onSelect, ariaLabel }: CategoryPillsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedPill = containerRef.current?.querySelector('[aria-pressed="true"]');

    selectedPill?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedId, pills.length]);

  return (
    <Row
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      spacing={1}
      sx={{
        overflowX: 'auto',
        pb: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {pills.map(pill => (
        <CategoryPill
          key={pill.id}
          pill={pill}
          isSelected={pill.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </Row>
  );
};

export default CategoryPills;
