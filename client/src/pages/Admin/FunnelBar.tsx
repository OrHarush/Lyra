import { Box, Typography } from '@mui/material';

import Row from '@/components/shared/layout/containers/Row';

interface FunnelBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const FunnelBar = ({ label, value, max, color }: FunnelBarProps) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <Row alignItems="center" spacing={1.5}>
      <Typography
        sx={{
          fontSize: 13,
          color: 'text.secondary',
          minWidth: 110,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ flex: 1, position: 'relative', height: 6 }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'action.hover',
            borderRadius: 3,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${pct}%`,
            bgcolor: color,
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          minWidth: 40,
          textAlign: 'end',
        }}
      >
        {value}
      </Typography>
    </Row>
  );
};

export default FunnelBar;
