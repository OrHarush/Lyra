import { useTheme } from '@mui/material';

export interface CategoryTickCaption {
  text: string;
  color: string;
  description: string;
}

interface CategoryAxisTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string; index: number };
  colors: string[];
  captions: (CategoryTickCaption | null)[];
}

const DOT_RADIUS = 4;
const DOT_OFFSET = 8;
const TEXT_OFFSET = 18;
const NAME_LIFT = 7;
const CAPTION_DROP = 9;

const CategoryAxisTick = ({ x = 0, y = 0, payload, colors, captions }: CategoryAxisTickProps) => {
  const theme = useTheme();

  if (!payload) {
    return null;
  }

  const caption = captions[payload.index];

  return (
    <g transform={`translate(${Number(x)},${Number(y)})`}>
      <circle cx={-DOT_OFFSET} cy={0} r={DOT_RADIUS} fill={colors[payload.index]} />
      <text
        x={-TEXT_OFFSET}
        y={caption ? -NAME_LIFT : 0}
        textAnchor="end"
        dominantBaseline="central"
        fill={theme.palette.text.secondary}
        fontSize={12}
      >
        {payload.value}
      </text>
      {caption && (
        <text
          x={-TEXT_OFFSET}
          y={CAPTION_DROP}
          textAnchor="end"
          dominantBaseline="central"
          fill={caption.color}
          fontSize={11}
          fontWeight={700}
        >
          <title>{caption.description}</title>
          {caption.text}
        </text>
      )}
    </g>
  );
};

export default CategoryAxisTick;
