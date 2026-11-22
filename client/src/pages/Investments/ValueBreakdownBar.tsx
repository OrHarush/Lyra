import { Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';

interface ValueBreakdownBarProps {
  invested: number;
  value: number;
}

const BAR_HEIGHT = 8;
const SEGMENT_GAP = 0.5;
const MIN_DELTA_WIDTH = 4;

// A loss is drawn against the original deposit, a gain against today's value, so the bar always fills the full width.
const ValueBreakdownBar = ({ invested, value }: ValueBreakdownBarProps) => {
  const isLoss = value < invested;
  const whole = isLoss ? invested : value;
  const principal = isLoss ? value : invested;
  const delta = Math.abs(value - invested);

  return (
    <Row spacing={SEGMENT_GAP} aria-hidden sx={{ height: BAR_HEIGHT }}>
      <Typography
        component="span"
        sx={{ flex: `${principal / whole} 1 0`, bgcolor: 'primary.main', borderRadius: 4 }}
      />
      {delta > 0 && (
        <Typography
          component="span"
          sx={{
            flex: `${delta / whole} 1 0`,
            minWidth: MIN_DELTA_WIDTH,
            bgcolor: isLoss ? 'error.main' : 'success.main',
            borderRadius: 4,
          }}
        />
      )}
    </Row>
  );
};

export default ValueBreakdownBar;
