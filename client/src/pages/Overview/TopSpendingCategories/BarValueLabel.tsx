import { useTheme } from '@mui/material';

import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency } from '@/utils/currency';

interface BarValueLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  value?: number | string;
}

const LABEL_GAP = 8;

const BarValueLabel = ({ x = 0, y = 0, width = 0, height = 0, value = 0 }: BarValueLabelProps) => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <text
      x={Number(x) + Number(width) + LABEL_GAP}
      y={Number(y) + Number(height) / 2}
      dominantBaseline="central"
      fill={theme.palette.text.primary}
      fontSize={12}
      fontWeight={600}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {formatCurrency(Number(value), user?.displayCurrency ?? 'ILS')}
    </text>
  );
};

export default BarValueLabel;
