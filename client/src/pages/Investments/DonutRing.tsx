import { ReactNode } from 'react';

import Column from '@/components/shared/layout/containers/Column';

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

interface DonutRingProps {
  segments: DonutSegment[];
  size: number;
  strokeWidth?: number;
  gap?: number;
  children?: ReactNode;
}

const DEFAULT_STROKE_WIDTH = 16;
const DEFAULT_GAP = 2;

const DonutRing = ({
  segments,
  size,
  strokeWidth = DEFAULT_STROKE_WIDTH,
  gap = DEFAULT_GAP,
  children,
}: DonutRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const visibleGap = segments.length > 1 ? gap : 0;

  let offset = 0;

  return (
    <Column
      alignItems="center"
      justifyContent="center"
      sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
        aria-hidden
      >
        {segments.map(segment => {
          const length = (segment.value / total) * circumference;
          const drawn = Math.max(length - visibleGap, 0);
          const circle = (
            <circle
              key={segment.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${drawn} ${circumference - drawn}`}
              strokeDashoffset={-offset}
            />
          );

          offset += length;

          return circle;
        })}
      </svg>
      {children}
    </Column>
  );
};

export default DonutRing;
