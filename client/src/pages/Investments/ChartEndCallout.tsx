interface ChartEndCalloutProps {
  cx?: number;
  cy?: number;
  valueLabel: string;
  dateLabel: string;
  chartHeight: number;
  pointColor: string;
  ringColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

const CALLOUT_WIDTH = 104;
const CALLOUT_HEIGHT = 44;
const CALLOUT_OFFSET = 14;
const POINT_RADIUS = 5;
const HALO_RADIUS = 10;
const HALO_OPACITY = 0.25;
const X_AXIS_ALLOWANCE = 28;

// Lives in SVG, where CurrencyText cannot render, so the caller passes pre-formatted labels.
const ChartEndCallout = ({
  cx,
  cy,
  valueLabel,
  dateLabel,
  chartHeight,
  pointColor,
  ringColor,
  textColor,
  mutedColor,
  borderColor,
}: ChartEndCalloutProps) => {
  if (cx === undefined || cy === undefined) {
    return <g />;
  }

  const hasRoomBelow = cy + CALLOUT_OFFSET + CALLOUT_HEIGHT < chartHeight - X_AXIS_ALLOWANCE;
  const top = hasRoomBelow ? cy + CALLOUT_OFFSET : cy - CALLOUT_OFFSET - CALLOUT_HEIGHT;
  const left = cx - CALLOUT_WIDTH + HALO_RADIUS;

  return (
    <g>
      <circle cx={cx} cy={cy} r={HALO_RADIUS} fill={pointColor} fillOpacity={HALO_OPACITY} />
      <circle cx={cx} cy={cy} r={POINT_RADIUS} fill={pointColor} stroke={ringColor} strokeWidth={2} />
      <rect
        x={left}
        y={top}
        width={CALLOUT_WIDTH}
        height={CALLOUT_HEIGHT}
        rx={8}
        fill={ringColor}
        stroke={borderColor}
      />
      <text
        x={left + CALLOUT_WIDTH / 2}
        y={top + 19}
        textAnchor="middle"
        fill={textColor}
        fontSize={13}
        fontWeight={700}
      >
        {valueLabel}
      </text>
      <text
        x={left + CALLOUT_WIDTH / 2}
        y={top + 35}
        textAnchor="middle"
        fill={mutedColor}
        fontSize={11}
      >
        {dateLabel}
      </text>
    </g>
  );
};

export default ChartEndCallout;
