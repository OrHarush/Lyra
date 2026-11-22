interface InvestedTagProps {
  x?: number;
  y?: number;
  label: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
}

const TAG_WIDTH = 124;
const TAG_HEIGHT = 24;
const TAG_LIFT = 12;

const InvestedTag = ({ x, y, label, backgroundColor, textColor, borderColor }: InvestedTagProps) => {
  if (x === undefined || y === undefined) {
    return <g />;
  }

  const left = x - TAG_WIDTH;
  const top = y - TAG_HEIGHT - TAG_LIFT;

  return (
    <g>
      <rect
        x={left}
        y={top}
        width={TAG_WIDTH}
        height={TAG_HEIGHT}
        rx={6}
        fill={backgroundColor}
        stroke={borderColor}
      />
      <text
        x={left + TAG_WIDTH / 2}
        y={top + TAG_HEIGHT / 2 + 4}
        textAnchor="middle"
        fill={textColor}
        fontSize={11}
      >
        {label}
      </text>
    </g>
  );
};

export default InvestedTag;
