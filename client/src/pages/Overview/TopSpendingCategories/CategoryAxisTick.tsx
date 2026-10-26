import { useTheme } from '@mui/material';

interface CategoryAxisTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string; index: number };
  colors: string[];
}

const DOT_RADIUS = 4;
const DOT_OFFSET = 8;
const TEXT_OFFSET = 18;

const CategoryAxisTick = ({ x = 0, y = 0, payload, colors }: CategoryAxisTickProps) => {
  const theme = useTheme();

  if (!payload) {
    return null;
  }

  return (
    <g transform={`translate(${Number(x)},${Number(y)})`}>
      <circle cx={-DOT_OFFSET} cy={0} r={DOT_RADIUS} fill={colors[payload.index]} />
      <text
        x={-TEXT_OFFSET}
        y={0}
        textAnchor="end"
        dominantBaseline="central"
        fill={theme.palette.text.secondary}
        fontSize={12}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default CategoryAxisTick;
