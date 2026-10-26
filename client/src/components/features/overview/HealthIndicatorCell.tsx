import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import Column from '@/components/shared/layout/containers/Column';
import { HealthTile } from '@/types/HealthTile';

interface HealthIndicatorCellProps {
  tile: HealthTile;
}

const HealthIndicatorCell = ({ tile }: HealthIndicatorCellProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: tile.danger ? 'error.main' : 'divider',
        bgcolor: tile.danger ? alpha(theme.palette.error.main, 0.1) : 'action.selected',
        height: '100%',
      }}
    >
      <Column spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {tile.label}
        </Typography>
        <Typography fontWeight={600} color={tile.danger ? 'error.main' : 'text.primary'}>
          {tile.value}
        </Typography>
        {tile.description && (
          <Typography variant="caption" color={tile.danger ? 'error.main' : 'text.secondary'}>
            {tile.description}
          </Typography>
        )}
      </Column>
    </Box>
  );
};

export default HealthIndicatorCell;
