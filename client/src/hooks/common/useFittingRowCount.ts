import { useLayoutEffect, useRef, useState } from 'react';

export const FIT_ROW_ATTRIBUTE = 'data-fit-row';

interface UseFittingRowCountOptions {
  isEnabled: boolean;
  fallbackCount: number;
  minCount: number;
  maxCount: number;
  rowGap: number;
  renderedRowCount: number;
}

// Counts how many whole rows fit in the container, measuring a real row so row height
// is never hard-coded. Needs at least one rendered row (marked with FIT_ROW_ATTRIBUTE).
export const useFittingRowCount = ({
  isEnabled,
  fallbackCount,
  minCount,
  maxCount,
  rowGap,
  renderedRowCount,
}: UseFittingRowCountOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fittingCount, setFittingCount] = useState(fallbackCount);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!isEnabled || !container) {
      return undefined;
    }

    const updateFittingCount = () => {
      const firstRow = container.querySelector<HTMLElement>(`[${FIT_ROW_ATTRIBUTE}]`);

      if (!firstRow) {
        return;
      }

      const rowHeight = firstRow.getBoundingClientRect().height;
      const rowsThatFit = Math.floor((container.clientHeight + rowGap) / (rowHeight + rowGap));

      setFittingCount(Math.min(Math.max(rowsThatFit, minCount), maxCount));
    };

    updateFittingCount();

    const observer = new ResizeObserver(updateFittingCount);

    observer.observe(container);

    return () => observer.disconnect();
  }, [isEnabled, minCount, maxCount, rowGap, renderedRowCount]);

  return { containerRef, count: isEnabled ? fittingCount : fallbackCount };
};
