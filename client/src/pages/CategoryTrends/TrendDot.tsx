interface TrendDotProps {
  cx?: number;
  cy?: number;
  payload?: { period: string };
  selectedPeriod: string;
  color: string;
}

const DOT_RADIUS = 4;
const SELECTED_DOT_RADIUS = 7;

const TrendDot = ({ cx, cy, payload, selectedPeriod, color }: TrendDotProps) => {
  if (cx === undefined || cy === undefined) {
    return null;
  }

  const isSelected = payload?.period === selectedPeriod;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? SELECTED_DOT_RADIUS : DOT_RADIUS}
      fill={color}
      stroke={isSelected ? '#fff' : 'none'}
      strokeWidth={2}
    />
  );
};

export default TrendDot;
