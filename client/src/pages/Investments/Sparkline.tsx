import { useTheme } from '@mui/material';

interface SparklineProps {
  values: number[];
  isLoss: boolean | null;
  height: number;
}

const VIEWBOX_WIDTH = 100;
const STROKE_WIDTH = 2;
const VERTICAL_PADDING = 3;

const toPoints = (values: number[], height: number) => {
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const usable = height - VERTICAL_PADDING * 2;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * VIEWBOX_WIDTH;
      const y = VERTICAL_PADDING + usable - ((value - min) / range) * usable;

      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
};

const Sparkline = ({ values, isLoss, height }: SparklineProps) => {
  const theme = useTheme();

  if (values.length < 2) {
    return <svg width="100%" height={height} aria-hidden />;
  }

  const stroke =
    isLoss === null
      ? theme.palette.text.secondary
      : isLoss
        ? theme.palette.error.main
        : theme.palette.success.main;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={toPoints(values, height)}
        fill="none"
        stroke={stroke}
        strokeWidth={STROKE_WIDTH}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default Sparkline;
